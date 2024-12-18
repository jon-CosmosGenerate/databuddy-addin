import json
from database.db_utils import execute_query
import requests

# SEC API Base URL
SEC_API_URL = "https://data.sec.gov/"
HEADERS = {
    "User-Agent": "YourApp/1.0 (your-email@example.com)"
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
        print("Error fetching company metadata:", e)

def insert_company_metadata(company_data):
    """Insert company metadata into the database."""
    sql = """
    INSERT INTO companies (name, ticker, cik, metadata)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (cik) DO NOTHING;
    """
    tickers = company_data.get("tickers", [])
    ticker = tickers[0] if tickers else None  # Safely get the first ticker or set None
    
    values = (
        company_data.get("name"),
        ticker,
        company_data.get("cik"),
        json.dumps(company_data)  # Convert dict to JSON
    )
    try:
        execute_query(sql, values)
        print(f"Inserted company metadata for {company_data.get('name')}.")
    except Exception as e:
        print("Error inserting company metadata:", e)


if __name__ == "__main__":
    # Step 1: Apply the schema
    apply_schema()
    
    # Step 2: List of CIKs for companies across sectors
    cik_list = {
        # Technology Sector
        "0000320193": "Apple Inc.",         # Apple
        "0000789019": "Microsoft Corp.",    # Microsoft
        "0001652044": "Alphabet Inc.",      # Alphabet (Google)
        "0001018724": "Amazon.com Inc.",    # Amazon
        "0001326801": "Meta Platforms Inc.",# Meta
        
        # Healthcare Sector
        "0000070858": "Pfizer Inc.",        # Pfizer
        "0000040545": "Johnson & Johnson",  # Johnson & Johnson
        
        # Financials Sector
        "0000732712": "JPMorgan Chase & Co.", # JPMorgan Chase
        
        # Consumer Goods
        "0000021344": "The Coca-Cola Company", # Coca-Cola
        
        # Industrials Sector
        "0000877890": "General Electric Co."  # General Electric
    }
    
    # Step 3: Fetch and insert metadata for each company
    for cik, name in cik_list.items():
        print(f"\nProcessing {name} (CIK: {cik})...")
        company_metadata = fetch_company_metadata(cik)
        
        if company_metadata:
            insert_company_metadata({
                "name": company_metadata.get("name", name),
                "tickers": company_metadata.get("tickers", []),
                "cik": cik
            })

    print("\nAll companies processed successfully.")
