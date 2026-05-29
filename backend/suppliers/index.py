"""
API для управления поставщиками товаров (CRUD).
При первом вызове автоматически создаёт таблицу suppliers и добавляет supplier_id в products.
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

FIELDS = ["name", "contact_name", "phone", "email", "country",
          "address", "website", "currency", "notes", "is_active"]


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def ensure_schema(cur, conn):
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.suppliers (
            id            SERIAL PRIMARY KEY,
            name          VARCHAR(255) NOT NULL,
            contact_name  VARCHAR(255),
            phone         VARCHAR(50),
            email         VARCHAR(255),
            country       VARCHAR(100) DEFAULT 'Китай',
            address       TEXT,
            website       VARCHAR(255),
            currency      VARCHAR(10) DEFAULT 'CNY',
            notes         TEXT,
            is_active     BOOLEAN DEFAULT TRUE,
            created_at    TIMESTAMP DEFAULT NOW(),
            updated_at    TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute(f"""
        CREATE UNIQUE INDEX IF NOT EXISTS suppliers_name_lower_idx
        ON {SCHEMA}.suppliers (LOWER(name))
    """)
    cur.execute(f"""
        ALTER TABLE {SCHEMA}.products
        ADD COLUMN IF NOT EXISTS supplier_id INTEGER
        REFERENCES {SCHEMA}.suppliers(id) ON DELETE SET NULL
    """)
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

        # GET — список поставщиков
        if method == "GET":
            supplier_id = params.get("id")

            if supplier_id:
                cur.execute(f"SELECT * FROM {SCHEMA}.suppliers WHERE id = %s", (supplier_id,))
                row = cur.fetchone()
                if not row:
                    return resp(404, {"error": "Поставщик не найден"})
                return resp(200, dict(row))

            search = params.get("search", "")
            where = "WHERE name ILIKE %s" if search else ""
            args = [f"%{search}%"] if search else []

            cur.execute(f"""
                SELECT s.*, COUNT(p.id) as products_count
                FROM {SCHEMA}.suppliers s
                LEFT JOIN {SCHEMA}.products p ON p.supplier_id = s.id
                {where}
                GROUP BY s.id
                ORDER BY s.is_active DESC, s.name
            """, args)
            rows = [dict(r) for r in cur.fetchall()]
            return resp(200, {"suppliers": rows, "total": len(rows)})

        # POST — создать поставщика
        elif method == "POST":
            name = (body.get("name") or "").strip()
            if not name:
                return resp(400, {"error": "Название обязательно"})

            cur.execute(
                f"SELECT id FROM {SCHEMA}.suppliers WHERE LOWER(name) = LOWER(%s)",
                (name,)
            )
            if cur.fetchone():
                return resp(409, {"error": f"Поставщик «{name}» уже существует"})

            present = {k: body[k] for k in FIELDS if k in body}
            cols = ", ".join(present.keys())
            placeholders = ", ".join(["%s"] * len(present))
            cur.execute(
                f"INSERT INTO {SCHEMA}.suppliers ({cols}) VALUES ({placeholders}) RETURNING *",
                list(present.values())
            )
            conn.commit()
            return resp(201, dict(cur.fetchone()))

        # PUT — обновить поставщика
        elif method == "PUT":
            supplier_id = params.get("id") or body.get("id")
            if not supplier_id:
                return resp(400, {"error": "Не указан id"})

            updates = {k: body[k] for k in FIELDS if k in body}
            if not updates:
                return resp(400, {"error": "Нет полей для обновления"})

            updates["updated_at"] = "NOW()"
            set_clause = ", ".join([
                f"{k} = NOW()" if v == "NOW()" else f"{k} = %s"
                for k, v in updates.items()
            ])
            vals = [v for v in updates.values() if v != "NOW()"]
            vals.append(supplier_id)

            cur.execute(
                f"UPDATE {SCHEMA}.suppliers SET {set_clause} WHERE id = %s RETURNING *",
                vals
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Поставщик не найден"})
            return resp(200, dict(row))

        # DELETE — мягкое удаление (деактивация)
        elif method == "DELETE":
            supplier_id = params.get("id")
            if not supplier_id:
                return resp(400, {"error": "Не указан id"})

            cur.execute(
                f"UPDATE {SCHEMA}.suppliers SET is_active = FALSE, updated_at = NOW() WHERE id = %s RETURNING id",
                (supplier_id,)
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Поставщик не найден"})
            return resp(200, {"deactivated_id": row["id"]})

        return resp(405, {"error": "Метод не поддерживается"})

    finally:
        cur.close()
        conn.close()
