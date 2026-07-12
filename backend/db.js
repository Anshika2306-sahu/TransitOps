const { Pool } = require('pg');
require('dotenv').config();

let pool;

const getDb = async () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Supabase
    });
  }
  return pool;
};

module.exports = { getDb };
