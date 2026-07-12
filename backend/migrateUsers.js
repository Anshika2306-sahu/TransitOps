const { getDb } = require('./db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const db = await getDb();
    
    await db.query('DROP TABLE IF EXISTS users CASCADE;');
    
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        is_locked BOOLEAN DEFAULT FALSE,
        lock_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const hash = await bcrypt.hash('admin123', 10);
    await db.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Admin Manager', 'manager@transitops.com', $1, 'Fleet Manager')
    `, [hash]);

    console.log('Users table migrated successfully for Anu code.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
