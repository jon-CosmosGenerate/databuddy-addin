// import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
// import { AppError } from '@/errors';
// import { configService } from '../config/ConfigService';

export class DatabaseService {
  private static instance: DatabaseService;
  // private pool: Pool;
  private connected: boolean = false;

  private constructor() {
    /*
    const config = configService.getDatabaseConfig();
    this.pool = new Pool(config);

    this.pool.on('error', (err: Error) => {
      console.error('Unexpected database pool error:', err);
      throw new AppError(
        'Database pool error',
        'DB_ERROR',
        'critical',
        'database',
        err
      );
    });
    */
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async ensureConnection(): Promise<void> {
    /*
    if (!this.connected) {
      try {
        const client = await this.pool.connect();
        client.release();
        this.connected = true;
      } catch (error) {
        throw new AppError(
          'Failed to connect to database',
          'DB_CONNECTION_ERROR',
          'critical',
          'database',
          error
        );
      }
    }
    */
  }

  async executeQuery<T>(query: string, params?: any[]): Promise<any> {
    throw new Error("DatabaseService is currently disabled. Use the API instead.");
  }

  async transaction<T>(callback: any): Promise<T> {
    throw new Error("DatabaseService is currently disabled. Use the API instead.");
  }

  async healthCheck(): Promise<boolean> {
    return false; // Indicate the database service is inactive
  }

  async cleanup(): Promise<void> {
    // No-op as pool is not initialized
    this.connected = false;
  }
}

// export const databaseService = DatabaseService.getInstance();
