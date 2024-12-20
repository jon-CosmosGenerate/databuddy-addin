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

def execute_query(query, values=None):
    """Executes a query and returns results for SELECT queries."""
    try:
        conn = get_connection()
        if not conn:
            return None
        cursor = conn.cursor()
        cursor.execute(query, values)

        # If the query is a SELECT, fetch the results
        if query.strip().lower().startswith("select"):
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            return results

        # Otherwise, commit the changes
        conn.commit()
        cursor.close()
        conn.close()
        print("Query executed successfully.")
    except Exception as e:
        print("Error executing query:", e)
        return None

