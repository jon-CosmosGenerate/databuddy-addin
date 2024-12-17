import { DatabaseService } from './DatabaseService';
import { MockDatabaseService } from './MockDatabaseService';

export const getDatabaseService = () => {
  if (process.env.NODE_ENV === 'development') {
    return MockDatabaseService.getInstance();
  }
  return DatabaseService.getInstance();
}

// Export this for use in your components
export default getDatabaseService();