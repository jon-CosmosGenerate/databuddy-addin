-- Grant privileges on the companies table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE companies_id_seq TO "JonathanNewman";

-- Grant privileges on the filings table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE filings_id_seq TO "JonathanNewman";

-- Grant privileges on the financials table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE financials_id_seq TO "JonathanNewman";

-- Verify table permissions
GRANT ALL PRIVILEGES ON TABLE companies TO "JonathanNewman";
GRANT ALL PRIVILEGES ON TABLE filings TO "JonathanNewman";
GRANT ALL PRIVILEGES ON TABLE financials TO "JonathanNewman";
