import dotenv from 'dotenv';

export interface DatabaseConfig {
  connectionString: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
}

export interface Config {
  database: DatabaseConfig;
  environment: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: Config;

  private constructor() {
    dotenv.config();

    this.config = {
      database: {
        connectionString: process.env.AZURE_POSTGRESQL_CONNECTION_STRING || '',
        ssl: {
          rejectUnauthorized: false
        }
      },
      environment: process.env.NODE_ENV || 'development'
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }
}

export const configService = ConfigService.getInstance();