import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { AppError } from '@/errors';
import { configService } from '../config/ConfigService';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;
  private connected: boolean = false;

  private constructor() {
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
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async ensureConnection(): Promise<void> {
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
  }

  async executeQuery<T extends QueryResultRow = any>(
    query: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    await this.ensureConnection();

    const client = await this.pool.connect();
    try {
      const result = await client.query<T>(query, params);
      return result;
    } catch (error) {
      throw new AppError(
        'Database query failed',
        'DB_QUERY_ERROR',
        'high',
        'database',
        error
      );
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    await this.ensureConnection();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new AppError(
        'Transaction failed',
        'DB_TRANSACTION_ERROR',
        'high',
        'database',
        error
      );
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.connected = false;
    }
  }
}

export const databaseService = DatabaseService.getInstance();