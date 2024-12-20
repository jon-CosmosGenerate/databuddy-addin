-- Grant privileges on the companies table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.companies_id_seq TO JonathanNewman;

-- Grant privileges on the filings table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.filings_id_seq TO JonathanNewman;

-- Grant privileges on the financials table sequence
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.financials_id_seq TO JonathanNewman;

-- Verify table permissions
GRANT ALL PRIVILEGES ON TABLE public.companies TO JonathanNewman;
GRANT ALL PRIVILEGES ON TABLE public.filings TO JonathanNewman;
GRANT ALL PRIVILEGES ON TABLE public.financials TO JonathanNewman;
