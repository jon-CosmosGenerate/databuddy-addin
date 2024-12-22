import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": os.getenv("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE")
}

def execute_query(query, params=None):
    """Executes a query and fetches results."""
    try:
        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                # Return fetched rows directly
                if query.strip().lower().startswith("select"):
                    return cursor.fetchall()
                conn.commit()
    except Exception as e:
        print("Error executing query:", e)
        return []


def test_connection():
    """Test the database connection."""
    try:
        conn = get_connection()
        if conn:
            print("Connection successful!")
            conn.close()
        else:
            print("Failed to connect.")
    except Exception as e:
        print("Error during connection test:", e)


def get_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        return None
