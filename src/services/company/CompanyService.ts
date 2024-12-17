// src/services/company/CompanyService.ts
import databaseService from '../database';
import { QueryResult } from 'pg';
import { DatabaseService } from '../database/DatabaseService';

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

class CompanyService {
  private static instance: CompanyService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  async searchCompanies(query: string, options: SearchOptions = {}): Promise<Company[]> {
    const { limit = 10, offset = 0, searchType = 'both' } = options;
    
    let whereClause = '';
    switch (searchType) {
      case 'name':
        whereClause = 'name ILIKE $1';
        break;
      case 'ticker':
        whereClause = 'ticker ILIKE $1';
        break;
      default:
        whereClause = 'name ILIKE $1 OR ticker ILIKE $1';
    }
    
    const sql = `
      SELECT id, name, ticker, sector, cik_str, description
      FROM companies
      WHERE ${whereClause}
      ORDER BY 
        CASE 
          WHEN ticker ILIKE $1 THEN 1
          WHEN name ILIKE $1 THEN 2
          ELSE 3
        END
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.db.executeQuery<Company>(sql, [`%${query}%`, limit, offset]);
      return result.rows.map(row => ({
        ...row,
        confidence: this.calculateConfidence(query, row)
      }));
    } catch (error) {
      console.error('Error searching companies:', error);
      throw new Error('Failed to search companies');
    }
  }

  private calculateConfidence(query: string, company: Company): number {
    const searchTerms = query.toLowerCase().split(' ');
    let score = 0;
    
    searchTerms.forEach(term => {
      if (company.name.toLowerCase().includes(term)) score += 0.4;
      if (company.ticker.toLowerCase().includes(term)) score += 0.3;
      if (company.sector.toLowerCase().includes(term)) score += 0.2;
      if (company.description?.toLowerCase().includes(term)) score += 0.1;
    });

    return Math.min(score, 1);
  }
}

export const companyService = CompanyService.getInstance();