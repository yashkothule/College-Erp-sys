const fs = require('fs');
const db = require('./config/db');

async function importSchema() {
    try {
        const schemaPath = require('path').join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // split by ; to execute statements one by one
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const stmt of statements) {
            if (stmt.trim()) {
                await db.query(stmt);
                console.log('Executed:', stmt.substring(0, 50) + '...');
            }
        }
        console.log('Schema imported successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error importing schema:', err);
        process.exit(1);
    }
}

importSchema();
