// src/services/api/AlphaVantageService.ts
import { AppError } from '@/errors';

export class AlphaVantageService {
  private static instance: AlphaVantageService;
  private readonly BASE_URL = 'https://www.alphavantage.co/query';
  private readonly API_KEY = process.env.ALPHA_VANTAGE_KEY;

  private constructor() {}

  public static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) {
      AlphaVantageService.instance = new AlphaVantageService();
    }
    return AlphaVantageService.instance;
  }

  async getStockQuote(symbol: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`
      );
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new AppError(data['Error Message'], 'API_ERROR', 'high', 'network');
      }
      
      return this.formatQuoteData(data['Global Quote']);
    } catch (error) {
      throw new AppError('Failed to fetch stock quote', 'API_ERROR', 'high', 'network', error);
    }
  }

  private formatQuoteData(data: any) {
    return {
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      volume: parseInt(data['06. volume']),
      lastUpdated: data['07. latest trading day']
    };
  }
}

export const alphaVantageService = AlphaVantageService.getInstance();