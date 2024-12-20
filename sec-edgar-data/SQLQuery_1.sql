-- Table: companies
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ticker VARCHAR(10),
    cik VARCHAR(10) UNIQUE NOT NULL,
    sic VARCHAR(10),
    industry VARCHAR(255),
    metadata JSONB
);

-- Table: filings
CREATE TABLE IF NOT EXISTS filings (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    filing_date DATE NOT NULL,
    filing_type VARCHAR(20),
    filing_url TEXT,
    metadata JSONB
);

-- Table: financials
CREATE TABLE IF NOT EXISTS financials (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    year INT NOT NULL,
    line_item VARCHAR(255) NOT NULL,
    value NUMERIC,
    metadata JSONB
);
