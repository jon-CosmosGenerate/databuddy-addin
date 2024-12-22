import csv
from yahooquery import Screener # type: ignore

def fetch_top_companies(output_file, count=1000):
    """Fetch top companies by market cap and save to CSV."""
    screener = Screener()
    try:
        results = screener.get_screeners('most_actives', count=count)
        quotes = results['quotes']

        with open(output_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['name', 'ticker', 'cik'])  # Adjust headers as needed

            for company in quotes:
                name = company.get('shortName')
                ticker = company.get('symbol')
                cik = company.get('cik', 'N/A')  # Ensure CIK is included

                if name and ticker and cik != 'N/A':
                    writer.writerow([name, ticker, cik])
                    print(f"Added: {name} ({ticker}) - CIK: {cik}")

        print(f"Priority companies saved to {output_file}")
    except Exception as e:
        print(f"Error fetching companies: {e}")

# Example Usage
if __name__ == "__main__":
    fetch_top_companies("priority_companies.csv")
