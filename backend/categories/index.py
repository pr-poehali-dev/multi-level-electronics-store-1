"""
API для управления категориями товаров (CRUD + инициализация).
При первом GET автоматически создаёт таблицу и базовые категории если их нет.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p54266347_multi_level_electron"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

DEFAULT_CATEGORIES = [
    ("Смартфоны",  "smartfony",   1, None),
    ("Ноутбуки",   "noutbuki",    2, None),
    ("Планшеты",   "planshety",   3, None),
    ("Аудио",      "audio",       4, None),
    ("Игровые",    "igrovye",     5, None),
    ("Умные часы", "umnye-chasy", 6, None),
    ("Аксессуары", "aksessuary",  7, None),
]


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def ensure_schema(cur, conn):
    """Создаёт таблицу категорий и поле category_id в products если их нет."""
    cur.execute("""
        CREATE TABLE IF NOT EXISTS t_p54266347_multi_level_electron.categories (
            id         SERIAL PRIMARY KEY,
            name       VARCHAR(255) NOT NULL,
            slug       VARCHAR(255),
            parent_id  INTEGER REFERENCES t_p54266347_multi_level_electron.categories(id) ON DELETE SET NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # Уникальный индекс (игнорируем если уже есть)
    cur.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_idx
        ON t_p54266347_multi_level_electron.categories (LOWER(name))
    """)

    # Добавляем category_id в products если нет
    cur.execute("""
        ALTER TABLE t_p54266347_multi_level_electron.products
        ADD COLUMN IF NOT EXISTS category_id INTEGER
        REFERENCES t_p54266347_multi_level_electron.categories(id) ON DELETE SET NULL
    """)

    conn.commit()

    # Вставляем дефолтные категории если таблица пустая
    cur.execute("SELECT COUNT(*) as cnt FROM t_p54266347_multi_level_electron.categories")
    if cur.fetchone()["cnt"] == 0:
        for name, slug, order, parent in DEFAULT_CATEGORIES:
            cur.execute(
                "INSERT INTO t_p54266347_multi_level_electron.categories (name, slug, sort_order, parent_id) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
                (name, slug, order, parent)
            )
        conn.commit()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        ensure_schema(cur, conn)

        # GET — дерево категорий
        if method == "GET":
            cur.execute("""
                SELECT c.*, COUNT(p.id) as products_count
                FROM t_p54266347_multi_level_electron.categories c
                LEFT JOIN t_p54266347_multi_level_electron.products p ON p.category_id = c.id
                GROUP BY c.id
                ORDER BY c.sort_order, c.name
            """)
            rows = [dict(r) for r in cur.fetchall()]

            # Строим дерево
            by_id = {r["id"]: {**r, "children": []} for r in rows}
            roots = []
            for r in rows:
                pid = r["parent_id"]
                if pid and pid in by_id:
                    by_id[pid]["children"].append(by_id[r["id"]])
                else:
                    roots.append(by_id[r["id"]])

            return resp(200, {"categories": roots, "flat": rows})

        # POST — создать категорию
        elif method == "POST":
            name = (body.get("name") or "").strip()
            if not name:
                return resp(400, {"error": "Название обязательно"})

            cur.execute(
                "SELECT id FROM t_p54266347_multi_level_electron.categories WHERE LOWER(name) = LOWER(%s)",
                (name,)
            )
            if cur.fetchone():
                return resp(409, {"error": f"Категория «{name}» уже существует"})

            cur.execute(
                """INSERT INTO t_p54266347_multi_level_electron.categories
                   (name, slug, parent_id, sort_order)
                   VALUES (%s, %s, %s, %s) RETURNING *""",
                (name, body.get("slug", ""), body.get("parent_id"), body.get("sort_order", 0))
            )
            conn.commit()
            return resp(201, dict(cur.fetchone()))

        # PUT — обновить категорию
        elif method == "PUT":
            cat_id = params.get("id") or body.get("id")
            if not cat_id:
                return resp(400, {"error": "Не указан id"})

            fields = {}
            for f in ("name", "slug", "parent_id", "sort_order"):
                if f in body:
                    fields[f] = body[f]
            if not fields:
                return resp(400, {"error": "Нет полей для обновления"})

            set_clause = ", ".join(f"{k} = %s" for k in fields)
            vals = list(fields.values()) + [cat_id]
            cur.execute(
                f"UPDATE t_p54266347_multi_level_electron.categories SET {set_clause} WHERE id = %s RETURNING *",
                vals
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Категория не найдена"})
            return resp(200, dict(row))

        # DELETE — удалить (сброс category_id у товаров делается каскадно через ON DELETE SET NULL)
        elif method == "DELETE":
            cat_id = params.get("id")
            if not cat_id:
                return resp(400, {"error": "Не указан id"})

            # Переносим дочерние категории к родителю удаляемой
            cur.execute(
                "SELECT parent_id FROM t_p54266347_multi_level_electron.categories WHERE id = %s",
                (cat_id,)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Категория не найдена"})

            parent = row["parent_id"]
            cur.execute(
                "UPDATE t_p54266347_multi_level_electron.categories SET parent_id = %s WHERE parent_id = %s",
                (parent, cat_id)
            )
            cur.execute(
                "UPDATE t_p54266347_multi_level_electron.products SET category_id = NULL WHERE category_id = %s",
                (cat_id,)
            )
            cur.execute(
                "SELECT id FROM t_p54266347_multi_level_electron.categories WHERE id = %s",
                (cat_id,)
            )
            if cur.fetchone():
                cur.execute(
                    "UPDATE t_p54266347_multi_level_electron.categories SET parent_id = NULL, sort_order = 0 WHERE id = %s",
                    (cat_id,)
                )
                # Мягкое удаление — переименовываем чтобы разблокировать unique index
                cur.execute(
                    "UPDATE t_p54266347_multi_level_electron.categories SET name = name || '_deleted_' || id WHERE id = %s",
                    (cat_id,)
                )
            conn.commit()
            return resp(200, {"deleted_id": int(cat_id)})

        return resp(405, {"error": "Метод не поддерживается"})

    finally:
        cur.close()
        conn.close()
