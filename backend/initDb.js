const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const initDb = async () => {
  try {
    const db = await getDb();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Executing schema on PostgreSQL...');
    await db.query(schemaSql);
    console.log('Database schema created successfully in PostgreSQL.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
