import json
import requests
import psycopg2
from sec_api import fetch_company_metadata, fetch_filings
from sec_api import fetch_and_store_submissions, fetch_and_store_company_facts, fetch_frame_data
from database.db_utils import execute_query
import json
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

def fetch_company_metadata(cik):
    """Fetch metadata for a specific company using the SEC API."""
    try:
        url = f"{SEC_API_URL}submissions/CIK{cik}.json"
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            print(f"Fetched metadata for CIK {cik}")
            return response.json()
        else:
            print(f"Failed to fetch metadata for CIK {cik}. Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching company metadata for CIK {cik}: {e}")
        return None

def insert_company_metadata(company_data):
    """Insert company metadata into the database."""
    sql = """
    INSERT INTO companies (name, ticker, cik, sic, industry, metadata)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (cik) DO UPDATE
    SET metadata = EXCLUDED.metadata;
    """
    tickers = company_data.get("tickers", [])
    ticker = tickers[0] if tickers else None  # Safely get the first ticker or set None

    values = (
        company_data.get("name"),
        ticker,
        company_data.get("cik"),
        company_data.get("sic", None),
        company_data.get("industry", None),
        json.dumps(company_data),  # Convert dict to JSON
    )
    try:
        execute_query(sql, values)
        print(f"Inserted/updated metadata for {company_data.get('name')}.")
    except Exception as e:
        print(f"Error inserting company metadata for {company_data.get('name')}: {e}")

def populate_companies_from_bulk():
    """Parse and populate companies from the bulk dataset."""
    try:
        with open("bulk_data/company_tickers.json", "r") as file:
            data = json.load(file)

        batch_size = 1000
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            for company in batch:
                execute_query("""
                    INSERT INTO companies (name, ticker, cik, metadata)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (cik) DO NOTHING
                """, (
                    company["title"],
                    company["ticker"],
                    company["cik_str"].zfill(10),  # Add leading zeros to CIK
                    json.dumps(company)  # Store raw metadata
                ))
            print(f"Inserted batch {i // batch_size + 1}")
        print("Bulk company data inserted successfully.")
    except Exception as e:
        print("Error processing bulk company data:", e)

def populate_companies():
    """Fetch and populate company data dynamically."""
    print("Populating companies...")
    cik_list = [
        "0000320193",  # Apple
        "0000789019",  # Microsoft
        "0001652044"   # Alphabet (Google)
    ]
    for cik in cik_list:
        print(f"Processing company with CIK: {cik}")
        metadata = fetch_company_metadata(cik)
        if metadata:
            insert_company_metadata({
                "name": metadata.get("name"),
                "tickers": metadata.get("tickers", []),
                "cik": cik,
                "sic": metadata.get("sic"),
                "industry": metadata.get("industry"),
                "metadata": metadata
            })

def populate_companies_and_filings():
    """Populate companies and filings using the submissions endpoint."""
    cik_list = ["0000320193", "0000789019", "0001652044"]  # Add more CIKs here
    for cik in cik_list:
        fetch_and_store_submissions(cik)

def populate_financials():
    """Populate financials using the companyfacts endpoint."""
    cik_list = ["0000320193", "0000789019", "0001652044"]  # Add more CIKs here
    for cik in cik_list:
        fetch_and_store_company_facts(cik)

def populate_frames():
    """Populate frame data for specific financial metrics."""
    cik = "0000320193"  # Example CIK for Apple
    fetch_frame_data("us-gaap", "Revenues", "USD", "CY2023")

def populate_companies_from_json(json_file):
    """Load company data from JSON file and insert into the database."""
    with open(json_file, 'r') as file:
        companies = json.load(file)

    for company in companies:
        try:
            execute_query("""
                INSERT INTO companies (name, ticker, cik, sic, industry, metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (cik) DO NOTHING;
            """, (
                company.get("name"),
                company.get("ticker"),
                company.get("cik"),
                company.get("sic"),
                company.get("industry"),
                json.dumps(company)  # Save the full metadata as JSON
            ))
            print(f"Inserted company: {company.get('name')} ({company.get('ticker')})")
        except Exception as e:
            print(f"Error inserting company: {company.get('name')} - {e}")


if __name__ == "__main__":
    # Step 1: Apply schema
    apply_schema()

    # Step 2: Populate companies from JSON
    print("Populating companies from JSON...")
    populate_companies_from_json("company_tickers.json")

    print("\nAll companies processed successfully.")