import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

def get_db_config():
    return {
        "dbname": os.environ.get("POSTGRES_DB", "elevenlabs"),
        "user": os.environ.get("POSTGRES_USER", "admin"),
        "password": os.environ.get("POSTGRES_PASSWORD", "admin"),
        "host": os.environ.get("POSTGRES_HOST", "localhost"),
        "port": os.environ.get("POSTGRES_PORT", "5432"),
    }

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = psycopg2.connect(**get_db_config(), cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

@contextmanager
def get_db_cursor():
    """Context manager for database cursors"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
