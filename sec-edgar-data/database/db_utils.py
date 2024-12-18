import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Database connection details from .env
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": os.getenv("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE")  # Ensure SSL is required
}

def get_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        return None

def execute_query(query, values=None):
    """Executes a query and commits changes."""
    try:
        conn = get_connection()
        if not conn:
            return
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        print("Query executed successfully.")
    except Exception as e:
        print("Error executing query:", e)
