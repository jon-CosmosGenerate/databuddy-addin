// src/services/company/types.ts
export interface Company {
    id: string;
    name: string;
    ticker: string;
    sector: string;
    cik_str: string;
    confidence?: number;
    description?: string;
  }
  
  export interface SearchOptions {
    limit?: number;
    offset?: number;
    searchType?: 'name' | 'ticker' | 'both';
  }