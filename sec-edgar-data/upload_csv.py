import psycopg2
import csv
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
    "port": os.getenv("DB_PORT")
}

# Connect to the database
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Open the CSV file
with open("company_tickers.csv", "r") as csv_file:
    reader = csv.DictReader(csv_file)  # Use DictReader for column headers
    for row in reader:
        cursor.execute("""
            INSERT INTO companies (cik, ticker, name)
            VALUES (%s, %s, %s)
            ON CONFLICT (cik) DO NOTHING;
        """, (row['cik'], row['ticker'], row['name']))

# Commit and close connection
conn.commit()
cursor.close()
conn.close()

print("Data uploaded successfully!")
