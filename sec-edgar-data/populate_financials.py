from database.db_utils import execute_query
from sec_api import fetch_and_store_company_facts

def populate_financials():
    """Fetch and populate the financials table."""
    companies = execute_query("SELECT id, cik FROM companies")
    for company in companies:
        company_id = company["id"]
        cik = company["cik"]
        try:
            # Fetch financial data using SEC API
            financials = fetch_and_store_company_facts(cik)
            for year, data in financials.items():
                for line_item, value in data.items():
                    # Insert each financial record into the database
                    execute_query("""
                        INSERT INTO financials (company_id, year, line_item, value, metadata)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT DO NOTHING
                    """, (
                        company_id,
                        year,
                        line_item,
                        value,
                        data
                    ))
            print(f"Inserted financials for Company ID: {company_id}, CIK: {cik}")
        except Exception as e:
            print(f"Error processing financials for CIK {cik}: {e}")

if __name__ == "__main__":
    populate_financials()
