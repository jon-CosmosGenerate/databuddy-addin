# PostgreSQL Database (DataBuddy Add-in)

sec-edgar-data/
  ├── database/
  │   ├── db_utils.py        # Handles database connections and queries
  │   ├── __init__.py        # Keeps the folder as a Python package
  ├── main.py                # Main script for controlling the workflow
  ├── sec_api.py             # NEW: Handles API requests
  ├── .env                   # Stores API headers and database credentials
  ├── requirements.txt       # Dependencies for the project
  ├── schema.sql             # Defines your database schema
  └── .venv/                 # Virtual environment


## APIs
We use various APIs, including those of federal agencies and our own proprietary APIs, to connect users with to more diverse and robust data interactions. Below is a list of some of the APIs we use, what we use them for, and to whom we owe credit.

### Securities and Exchange Commission (SEC) key endpoints and use cases

1. Submissions (/submissions/cik##########.json)
    - Populate `companies` with metadata
    - Populate `filings` with the latest 1,000 filings per company (further additions with application platform development)
2. Company Facts (/api/xbrl/companyfacts/cik##########.json)
    - Populate historical and ongoing financials from reporting with detailed line items from XBRL data
3. Company Concept (api/xbrl/companyconcept/CIK##########/taxonomy/tag.json)
    - Query financial data for specific tags (e.g., Revenue, NetIncome, Assets)
    - Supports filtering by units and detailed breakdowns
4. Frames (/api/xbrl/frames/taxonomy/tag/unit/period.json)
    - Summarizing and analyzing annual and quarterly data for comparative and relative analysis
    - Supports precise queries (e.g., Excel custom functions)
5. Bulk (historical data) Downloads
    - Populate the database with historical filings and financial data

