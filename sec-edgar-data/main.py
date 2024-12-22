import json
import requests
import csv
from sec_api import (
    fetch_company_metadata,
    fetch_filings,
    fetch_and_store_submissions,
    fetch_and_store_company_facts,
    fetch_frame_data
)
from database.db_utils import execute_query

# SEC API Base URL
SEC_API_URL = "https://data.sec.gov/"
HEADERS = {
    "User-Agent": "DataBuddy/1.0 (jonathan@cosmosgenerate.com)"
}

def apply_schema():
    """Reads and applies the schema from schema.sql to the database."""
    try:
        with open("database/schema.sql", "r") as file:
            schema = file.read()
        execute_query(schema)
        print("Database schema applied successfully.")
    except Exception as e:
        print("Error applying schema:", e)

def populate_companies_from_csv(csv_file):
    """Populate companies table from a CSV file."""
    try:
        with open(csv_file, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    execute_query(
                        """
                        INSERT INTO companies (name, ticker, cik, sic, industry, metadata)
                        VALUES (%s, %s, %s, NULL, NULL, %s)
                        ON CONFLICT (cik) DO NOTHING;
                        """,
                        (
                            row["name"],
                            row["ticker"],
                            row["cik"],
                            json.dumps(row),  # Store the entire row as metadata
                        )
                    )
                    print(f"Inserted company: {row['name']}")
                except Exception as e:
                    print(f"Error inserting company: {row['name']} - {e}")
    except Exception as e:
        print(f"Error reading CSV file: {e}")

def populate_companies_and_filings():
    """Populate companies and filings using the submissions endpoint."""
    try:
        companies = execute_query("SELECT cik FROM companies")
        for company in companies:
            fetch_and_store_submissions(company["cik"])
            print(f"Processed filings for CIK: {company['cik']}")
    except Exception as e:
        print("Error processing filings:", e)

def populate_financials():
    """Populate financials using the companyfacts endpoint."""
    try:
        companies = execute_query("SELECT cik FROM companies")
        for company in companies:
            fetch_and_store_company_facts(company["cik"])
            print(f"Processed financials for CIK: {company['cik']}")
    except Exception as e:
        print("Error processing financials:", e)

if __name__ == "__main__":
    # Step 1: Apply schema
    apply_schema()

    # Step 2: Populate companies from CSV
    print("Populating companies from CSV...")
    populate_companies_from_csv("company_tickers.csv")

    # Step 3: Populate filings
    print("Populating filings...")
    populate_companies_and_filings()

    # Step 4: Populate financials
    print("Populating financials...")
    populate_financials()

    print("\nData ingestion complete.")
