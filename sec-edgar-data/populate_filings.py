def populate_filings():
    companies = execute_query("SELECT id, cik FROM companies")

    for company in companies:
        cik = company["cik"]
        try:
            # Fetch filings from the API
            filings = fetch_filings(cik)

            if not filings:
                print(f"No filings found for CIK {cik}. Skipping...")
                continue

            for filing in filings:
                # Check for required fields
                if not filing.get("filing_date") or not filing.get("filing_type"):
                    print(f"Skipping invalid filing: {filing}")
                    continue

                # Insert into the database
                execute_query(
                    "INSERT INTO filings (company_id, filing_date, filing_type, filing_url, metadata) VALUES (%s, %s, %s, %s, %s)",
                    (
                        company["id"],
                        filing["filing_date"],
                        filing["filing_type"],
                        filing.get("filing_url", None),
                        json.dumps(filing),
                    ),
                )
                print(f"Inserted filing for CIK {cik}: {filing['filing_type']}")
        except Exception as e:
            print(f"Error processing filings for CIK {cik}: {e}")
