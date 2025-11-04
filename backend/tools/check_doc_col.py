import os
import psycopg2
from dotenv import load_dotenv


def main():
    # Load env file in backend directory
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "env"))
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL not found in env")
    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'lessons'
                  AND column_name = 'document_url'
                """
            )
            rows = cur.fetchall()
            print(rows)
            if rows:
                print("OK: lessons.document_url exists")
            else:
                print("MISSING: lessons.document_url not found")
    finally:
        conn.close()


if __name__ == "__main__":
    main()