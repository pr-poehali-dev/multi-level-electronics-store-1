"""
Импорт товаров из CSV/Excel + загрузка фото в S3.
POST multipart JSON: { csv_base64, filename, photos: [{name, base64, mime}] }
Проверяет дубли по LOWER(naimenovanie), пропускает существующие.
"""
import base64
import io
import json
import os
import re
import uuid

import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p54266347_multi_level_electron"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

# Маппинг заголовков CSV/Excel → поля БД (регистронезависимо)
COLUMN_MAP = {
    "код китай": "kod_kitay", "kod_kitay": "kod_kitay", "код товара китай": "kod_kitay",
    "наименование": "naimenovanie", "naimenovanie": "naimenovanie", "название": "naimenovanie",
    "артикул": "artikul", "artikul": "artikul",
    "штрихкод": "shtrikhkod", "shtrikhkod": "shtrikhkod", "barcode": "shtrikhkod",
    "закупочная цена юань": "zakup_tsena_yuan", "цена юань": "zakup_tsena_yuan", "zakup_tsena_yuan": "zakup_tsena_yuan",
    "курс юаня": "kurs_yuan", "курс ю": "kurs_yuan", "kurs_yuan": "kurs_yuan",
    "цена доставки": "tsena_dostavki", "tsena_dostavki": "tsena_dostavki",
    "вес товара": "ves_tovara", "вес": "ves_tovara", "ves_tovara": "ves_tovara",
    "габариты упаковки": "gabarity_upakovki", "gabarity_upakovki": "gabarity_upakovki", "габариты": "gabarity_upakovki",
    "курс доллара": "kurs_dollara", "kurs_dollara": "kurs_dollara",
    "ставка кг": "stavka_kg", "stavka_kg": "stavka_kg",
    "ставка куб": "stavka_kub", "stavka_kub": "stavka_kub",
    "себестоимость": "sebestoimost", "sebestoimost": "sebestoimost",
    "фифо": "fifo", "fifo": "fifo",
    "лифо": "lifo", "lifo": "lifo",
    "продажная розница цена": "prodazh_tsena_roznitsa", "цена розница": "prodazh_tsena_roznitsa",
    "розница": "prodazh_tsena_roznitsa", "prodazh_tsena_roznitsa": "prodazh_tsena_roznitsa",
    "продажная цена опт": "prodazh_tsena_opt", "цена опт": "prodazh_tsena_opt",
    "опт": "prodazh_tsena_opt", "prodazh_tsena_opt": "prodazh_tsena_opt",
    "количество": "kolichestvo", "kolichestvo": "kolichestvo",
    "остаток": "ostatok", "ostatok": "ostatok",
    "сумма": "summa", "summa": "summa",
    "заказано": "zakazano", "zakazano": "zakazano",
    "отгружено": "otgruzheno", "отгружено": "otgruzheno", "otgruzheno": "otgruzheno",
    "возврат поставщику": "vozvrat_postavshchiku", "vozvrat_postavshchiku": "vozvrat_postavshchiku",
    "возврат от покупателя": "vozvrat_ot_pokupatelya", "vozvrat_ot_pokupatelya": "vozvrat_ot_pokupatelya",
    "цвет": "tsvet", "tsvet": "tsvet", "color": "tsvet",
    "фото": "photo_url", "photo_url": "photo_url", "photo": "photo_url", "изображение": "photo_url",
}

NUMERIC_FIELDS = {
    "zakup_tsena_yuan", "kurs_yuan", "tsena_dostavki", "ves_tovara",
    "kurs_dollara", "stavka_kg", "stavka_kub", "sebestoimost",
    "fifo", "lifo", "prodazh_tsena_roznitsa", "prodazh_tsena_opt",
    "kolichestvo", "ostatok", "summa", "zakazano", "otgruzheno",
    "vozvrat_postavshchiku", "vozvrat_ot_pokupatelya",
}


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str)
    }


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def upload_photo(s3, name_b64: str, mime: str, data_b64: str) -> str:
    raw = base64.b64decode(data_b64)
    ext = mime.split("/")[-1].replace("jpeg", "jpg")
    key = f"products/{uuid.uuid4().hex}.{ext}"
    s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=mime)
    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"


def parse_csv(content: str):
    lines = [l for l in content.splitlines() if l.strip()]
    if not lines:
        return []

    # Определяем разделитель: ; или ,
    sep = ";" if lines[0].count(";") >= lines[0].count(",") else ","

    def split_row(line):
        # Простой CSV-парсер с учётом кавычек
        result = []
        current = ""
        in_quotes = False
        for ch in line:
            if ch == '"':
                in_quotes = not in_quotes
            elif ch == sep and not in_quotes:
                result.append(current.strip().strip('"'))
                current = ""
            else:
                current += ch
        result.append(current.strip().strip('"'))
        return result

    headers_raw = split_row(lines[0])
    headers = [h.strip().lower() for h in headers_raw]

    rows = []
    for line in lines[1:]:
        if not line.strip():
            continue
        cols = split_row(line)
        row = {}
        for i, h in enumerate(headers):
            db_col = COLUMN_MAP.get(h)
            if db_col and i < len(cols):
                row[db_col] = cols[i].strip()
        if row:
            rows.append(row)
    return rows


def parse_excel(data: bytes):
    import zipfile
    import xml.etree.ElementTree as ET

    rows = []
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))

        # Читаем shared strings
        shared = []
        if "xl/sharedStrings.xml" in zf.namelist():
            ss_xml = zf.read("xl/sharedStrings.xml")
            ss_root = ET.fromstring(ss_xml)
            ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
            for si in ss_root.findall("x:si", ns):
                t_nodes = si.findall(".//x:t", ns)
                shared.append("".join(t.text or "" for t in t_nodes))

        # Читаем первый лист
        sheet_xml = zf.read("xl/worksheets/sheet1.xml")
        sheet_root = ET.fromstring(sheet_xml)
        ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

        def cell_value(cell):
            t = cell.get("t", "")
            v_el = cell.find("x:v", ns)
            if v_el is None:
                return ""
            val = v_el.text or ""
            if t == "s":
                idx = int(val)
                return shared[idx] if idx < len(shared) else ""
            return val

        all_rows = []
        for row_el in sheet_root.findall(".//x:row", ns):
            cells = row_el.findall("x:c", ns)
            row_vals = [cell_value(c) for c in cells]
            all_rows.append(row_vals)

        if not all_rows:
            return []

        headers = [v.strip().lower() for v in all_rows[0]]
        for row_vals in all_rows[1:]:
            if not any(row_vals):
                continue
            row = {}
            for i, h in enumerate(headers):
                db_col = COLUMN_MAP.get(h)
                if db_col and i < len(row_vals):
                    row[db_col] = str(row_vals[i]).strip()
            if row:
                rows.append(row)
    except Exception as e:
        raise ValueError(f"Ошибка парсинга Excel: {e}")

    return rows


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return resp(405, {"error": "Только POST"})

    body = json.loads(event.get("body") or "{}")
    file_b64 = body.get("file_base64", "")
    filename = body.get("filename", "file.csv").lower()
    photos = body.get("photos", [])  # [{name, base64, mime}]

    if not file_b64:
        return resp(400, {"error": "Нет файла (file_base64)"})

    # Парсим файл
    file_bytes = base64.b64decode(file_b64)
    if filename.endswith(".csv") or filename.endswith(".txt"):
        for enc in ("utf-8-sig", "utf-8", "cp1251", "latin-1"):
            try:
                content = file_bytes.decode(enc)
                break
            except Exception:
                continue
        items = parse_csv(content)
    elif filename.endswith(".xlsx"):
        items = parse_excel(file_bytes)
    else:
        return resp(400, {"error": "Поддерживаются только CSV и XLSX файлы"})

    if not items:
        return resp(400, {"error": "Файл пустой или не содержит данных"})

    # Строим индекс фото по имени файла (без расширения, lower)
    photo_index = {}
    for ph in photos:
        ph_name = re.sub(r"\.[^.]+$", "", ph.get("name", "")).lower().strip()
        photo_index[ph_name] = ph

    # Загружаем фото в S3
    s3 = get_s3()
    uploaded_photos = {}
    for ph_name, ph in photo_index.items():
        url = upload_photo(s3, ph_name, ph.get("mime", "image/jpeg"), ph["base64"])
        uploaded_photos[ph_name] = url

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    added = 0
    skipped = []
    errors = []

    for item in items:
        name = item.get("naimenovanie", "").strip()
        if not name:
            errors.append("Пропущена строка без наименования")
            continue

        # Проверка дубля (регистронезависимо)
        cur.execute(
            f"SELECT id FROM {SCHEMA}.products WHERE LOWER(naimenovanie) = LOWER(%s)",
            (name,)
        )
        if cur.fetchone():
            skipped.append(name)
            continue

        # Привязываем фото: ищем по наименованию или артикулу (без расширения)
        photo_url = item.get("photo_url", "")
        if not photo_url:
            # Пробуем найти по наименованию
            lookup_name = name.lower().strip()
            lookup_art = item.get("artikul", "").lower().strip()
            for ph_name, url in uploaded_photos.items():
                if ph_name == lookup_name or (lookup_art and ph_name == lookup_art):
                    photo_url = url
                    break

        if photo_url:
            item["photo_url"] = photo_url

        # Конвертируем числовые поля
        for f in NUMERIC_FIELDS:
            if f in item and item[f] != "":
                try:
                    item[f] = float(str(item[f]).replace(",", ".").replace(" ", ""))
                except Exception:
                    item[f] = 0
            elif f in item:
                item[f] = 0

        # Убираем пустые строки
        clean = {k: v for k, v in item.items() if v != "" and v is not None}

        cols = ", ".join(clean.keys())
        placeholders = ", ".join(["%s"] * len(clean))
        cur.execute(
            f"INSERT INTO {SCHEMA}.products ({cols}) VALUES ({placeholders})",
            list(clean.values())
        )
        added += 1

    conn.commit()
    cur.close()
    conn.close()

    return resp(200, {
        "added": added,
        "skipped": skipped,
        "skipped_count": len(skipped),
        "errors": errors,
        "total_in_file": len(items),
    })
