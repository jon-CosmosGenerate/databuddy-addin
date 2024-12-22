import json
import csv

# Open and read the JSON file
try:
    with open("company_tickers.json", "r") as json_file:
        companies = json.load(json_file)

    # Ensure the JSON is not empty
    if not companies:
        print("JSON file is empty or not properly formatted!")
        exit()

    print(f"Loaded {len(companies)} companies from JSON.")

    # Open the CSV file for writing
    with open("company_tickers.csv", "w", newline="") as csv_file:
        writer = csv.writer(csv_file)
        # Write headers
        writer.writerow(["cik", "ticker", "name"])
        for key, company in companies.items():  # Iterate over dictionary items
            writer.writerow([
                company.get("cik_str"),
                company.get("ticker"),
                company.get("title")
            ])
    print("JSON converted to CSV successfully!")

except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
except FileNotFoundError as e:
    print(f"JSON file not found: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
