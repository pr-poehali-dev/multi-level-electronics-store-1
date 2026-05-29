"""API для управления товарами магазина электроники (CRUD + photo_url)."""
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

ALL_FIELDS = [
    "kod_kitay", "naimenovanie", "artikul", "shtrikhkod",
    "zakup_tsena_yuan", "kurs_yuan", "tsena_dostavki", "ves_tovara",
    "gabarity_upakovki", "kurs_dollara", "stavka_kg", "stavka_kub",
    "sebestoimost", "fifo", "lifo", "prodazh_tsena_roznitsa",
    "prodazh_tsena_opt", "kolichestvo", "ostatok", "summa",
    "zakazano", "otgruzheno", "vozvrat_postavshchiku",
    "vozvrat_ot_pokupatelya", "tsvet", "photo_url"
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str)
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            product_id = params.get("id")
            search = params.get("search", "")
            limit = int(params.get("limit", 50))
            offset = int(params.get("offset", 0))

            if product_id:
                cur.execute(f"SELECT * FROM {SCHEMA}.products WHERE id = %s", (product_id,))
                row = cur.fetchone()
                if not row:
                    return resp(404, {"error": "Товар не найден"})
                return resp(200, dict(row))

            where = ""
            args = []
            if search:
                where = "WHERE naimenovanie ILIKE %s OR artikul ILIKE %s OR kod_kitay ILIKE %s"
                like = f"%{search}%"
                args = [like, like, like]

            cur.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.products {where}", args)
            total = cur.fetchone()["total"]
            cur.execute(
                f"SELECT * FROM {SCHEMA}.products {where} ORDER BY id DESC LIMIT %s OFFSET %s",
                args + [limit, offset]
            )
            rows = [dict(r) for r in cur.fetchall()]
            return resp(200, {"items": rows, "total": total, "limit": limit, "offset": offset})

        elif method == "POST":
            present = {k: body[k] for k in ALL_FIELDS if k in body}
            if "naimenovanie" not in present:
                return resp(400, {"error": "Поле naimenovanie обязательно"})

            cols = ", ".join(present.keys())
            placeholders = ", ".join(["%s"] * len(present))
            cur.execute(
                f"INSERT INTO {SCHEMA}.products ({cols}) VALUES ({placeholders}) RETURNING *",
                list(present.values())
            )
            conn.commit()
            return resp(201, dict(cur.fetchone()))

        elif method == "PUT":
            product_id = params.get("id") or body.get("id")
            if not product_id:
                return resp(400, {"error": "Не указан id товара"})

            updates = {k: body[k] for k in ALL_FIELDS if k in body}
            if not updates:
                return resp(400, {"error": "Нет полей для обновления"})

            updates["updated_at"] = "NOW()"
            set_clause = ", ".join([
                f"{k} = NOW()" if v == "NOW()" else f"{k} = %s"
                for k, v in updates.items()
            ])
            vals = [v for v in updates.values() if v != "NOW()"]
            vals.append(product_id)

            cur.execute(
                f"UPDATE {SCHEMA}.products SET {set_clause} WHERE id = %s RETURNING *",
                vals
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Товар не найден"})
            return resp(200, dict(row))

        elif method == "DELETE":
            product_id = params.get("id")
            if not product_id:
                return resp(400, {"error": "Не указан id товара"})

            cur.execute(f"DELETE FROM {SCHEMA}.products WHERE id = %s RETURNING id", (product_id,))
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Товар не найден"})
            return resp(200, {"deleted_id": row["id"]})

        return resp(405, {"error": "Метод не поддерживается"})

    finally:
        cur.close()
        conn.close()
