// src/scripts/testConnection.ts
import { DatabaseService } from '@/services/database/DatabaseService';

async function testDatabaseConnection() {
    const db = DatabaseService.getInstance();
    
    try {
        // Try a simple query
        const result = await db.executeQuery('SELECT NOW()');
        console.log('Database connection successful!');
        console.log('Current timestamp from DB:', result.rows[0].now);
        
        // Get database info
        const dbInfo = await db.executeQuery(`
            SELECT 
                current_database() as db_name,
                current_schema() as schema_name,
                current_user as user_name
        `);
        console.log('\nConnection Details:', dbInfo.rows[0]);
        
        // List tables in current schema
        const tables = await db.executeQuery(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = current_schema()
        `);
        
        console.log('\nAvailable tables:');
        tables.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await db.cleanup();
    }
}

testDatabaseConnection().catch(console.error);