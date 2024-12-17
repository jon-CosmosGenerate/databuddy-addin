import psycopg2

# Database connection details
DB_HOST = "az-env-vuj6lxpotuuqq-postgresql.postgres.database.azure.com"
DB_USER = "JonathanNewman"
DB_PASSWORD = "your-password-here"
DB_NAME = "sec-database"
DB_PORT = 5432

# SQL queries for table creation
CREATE_COMPANIES_TABLE = """
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ticker VARCHAR(10),
    cik VARCHAR(10),
    sic VARCHAR(10),
    industry VARCHAR(255),
    metadata JSONB
);
"""

CREATE_FILINGS_TABLE = """
CREATE TABLE IF NOT EXISTS filings (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    filing_date DATE,
    filing_type VARCHAR(20),
    filing_url TEXT,
    metadata JSONB
);
"""

CREATE_FINANCIALS_TABLE = """
CREATE TABLE IF NOT EXISTS financials (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    year INT,
    line_item VARCHAR(255),
    value NUMERIC,
    metadata JSONB
);
"""

# Function to connect to the database and create tables
def create_tables():
    try:
        # Connect to the existing database
        conn = psycopg2.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME
        )
        cursor = conn.cursor()
        print(f"Connected to the database: {DB_NAME}")

        # Create tables
        cursor.execute(CREATE_COMPANIES_TABLE)
        print("Table 'companies' created or already exists.")
        
        cursor.execute(CREATE_FILINGS_TABLE)
        print("Table 'filings' created or already exists.")
        
        cursor.execute(CREATE_FINANCIALS_TABLE)
        print("Table 'financials' created or already exists.")

        # Commit changes and close connection
        conn.commit()
        cursor.close()
        conn.close()
        print("Tables created successfully and connection closed.")

    except Exception as e:
        print("Error:", e)

# Execute the function
if __name__ == "__main__":
    create_tables()
