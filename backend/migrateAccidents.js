const { getDb } = require('./db');
(async () => {
  try {
    const db = await getDb();
    await db.query(`
      CREATE TABLE IF NOT EXISTS accidents (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id),
        driver_id INTEGER REFERENCES drivers(id),
        location_lat DECIMAL(10, 6),
        location_lng DECIMAL(10, 6),
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Accidents table created.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
