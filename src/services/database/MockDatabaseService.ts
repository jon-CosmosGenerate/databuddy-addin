import { QueryResult, QueryResultRow } from 'pg';

export class MockDatabaseService {
  private static instance: MockDatabaseService;

  private constructor() {}

  public static getInstance(): MockDatabaseService {
    if (!MockDatabaseService.instance) {
      MockDatabaseService.instance = new MockDatabaseService();
    }
    return MockDatabaseService.instance;
  }

  async executeQuery<T extends QueryResultRow>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    console.log('Mock DB Query:', sql, params);
    return {
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    } as QueryResult<T>;
  }

  async cleanup(): Promise<void> {
    // No-op for mock
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

export const mockDatabaseService = MockDatabaseService.getInstance();