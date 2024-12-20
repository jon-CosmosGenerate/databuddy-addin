import json
import requests
from dotenv import load_dotenv
import os
from database.db_utils import execute_query

# Load environment variables
load_dotenv()

# Define API headers
HEADERS = {
    "User-Agent": "DataBuddy App/1.0 (jonathan@cosmosgenerate.com)"
}

BASE_URL = "https://data.sec.gov/"

def fetch_data(url):
    """Fetch data from a given URL."""
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None

def fetch_company_metadata(cik):
    """Fetch metadata for a specific company using the SEC API."""
    url = f"{BASE_URL}submissions/CIK{cik}.json"
    return fetch_data(url)

def fetch_filings(cik):
    """Fetch filing details for a specific company."""
    url = f"{BASE_URL}submissions/CIK{cik}.json"
    data = fetch_data(url)
    return data.get("filings", {}).get("recent", {}) if data else None

def fetch_and_store_submissions(cik):
    """Fetch and store company metadata and filings."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    data = fetch_data(url)
    if data:
        # Insert company metadata
        execute_query("""
            INSERT INTO companies (name, ticker, cik, sic, industry, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (cik) DO NOTHING
        """, (
            data.get("entityName"),
            data.get("tickers", [None])[0],
            cik,
            data.get("sic"),
            data.get("industry", None),
            json.dumps(data)
        ))

        # Insert filings metadata
        filings = data.get("filings", {}).get("recent", {})
        for i, filing in enumerate(filings.get("form", [])):
            execute_query("""
                INSERT INTO filings (company_id, filing_date, filing_type, filing_url, metadata)
                VALUES (
                    (SELECT id FROM companies WHERE cik = %s),
                    %s, %s, %s, %s
                )
                ON CONFLICT DO NOTHING
            """, (
                cik,
                filings.get("date", [None])[i],
                filing,
                f"https://www.sec.gov/Archives/edgar/data/{cik}/{filings.get('accessionNumber', [None])[i].replace('-', '')}/index.html",
                json.dumps({k: v[i] for k, v in filings.items()})
            ))
        print(f"Submissions for CIK {cik} stored successfully.")
    else:
        print(f"Failed to fetch submissions for CIK {cik}")

def fetch_and_store_company_facts(cik):
    """Fetch and store financial data using companyfacts endpoint."""
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    data = fetch_data(url)
    if data:
        facts = data.get("facts", {}).get("us-gaap", {})
        for concept, details in facts.items():
            for unit, fact_list in details.get("units", {}).items():
                for fact in fact_list:
                    execute_query("""
                        INSERT INTO financials (company_id, year, line_item, value, metadata)
                        VALUES (
                            (SELECT id FROM companies WHERE cik = %s),
                            %s, %s, %s, %s
                        )
                        ON CONFLICT DO NOTHING
                    """, (
                        cik,
                        fact.get("fy"),
                        concept,
                        fact.get("val"),
                        json.dumps(fact)
                    ))
        print(f"Company facts for CIK {cik} stored successfully.")
    else:
        print(f"Failed to fetch company facts for CIK {cik}")

def fetch_frame_data(taxonomy, tag, unit, period):
    """Fetch aggregated data for a taxonomy, tag, and period."""
    url = f"https://data.sec.gov/api/xbrl/frames/{taxonomy}/{tag}/{unit}/{period}.json"
    data = fetch_data(url)
    if data:
        for item in data:
            execute_query("""
                INSERT INTO financials (company_id, year, line_item, value, metadata)
                VALUES (
                    (SELECT id FROM companies WHERE ticker = %s),
                    %s, %s, %s, %s
                )
                ON CONFLICT DO NOTHING
            """, (
                item.get("entityName"),
                item.get("period"),
                tag,
                item.get("val"),
                json.dumps(item)
            ))
        print(f"Frame data for {tag} in {period} stored successfully.")
    else:
        print(f"Failed to fetch frame data")
