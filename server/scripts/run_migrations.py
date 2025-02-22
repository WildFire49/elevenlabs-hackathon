import logging
import os

from utils.db import get_db_cursor

logger = logging.getLogger(__name__)

def run_migrations():
    """Run all SQL migrations in the migrations directory"""
    migrations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'migrations')
    
    with get_db_cursor() as cursor:
        # Create migrations table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Get list of applied migrations
        cursor.execute("SELECT filename FROM migrations")
        applied_migrations = {row['filename'] for row in cursor.fetchall()}
        
        # Apply new migrations
        for filename in sorted(os.listdir(migrations_dir)):
            if filename.endswith('.sql') and filename not in applied_migrations:
                migration_path = os.path.join(migrations_dir, filename)
                logger.info(f"Applying migration: {filename}")
                
                with open(migration_path, 'r') as f:
                    sql = f.read()
                    cursor.execute(sql)
                
                cursor.execute(
                    "INSERT INTO migrations (filename) VALUES (%s)",
                    (filename,)
                )
                logger.info(f"Successfully applied migration: {filename}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migrations()
