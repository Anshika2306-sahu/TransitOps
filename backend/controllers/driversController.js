const { getDb } = require('../db');

const getDrivers = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query('SELECT * FROM drivers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

const createDriver = async (req, res) => {
  const { name, license_number, license_category, license_expiry_date, contact_number } = req.body;
  try {
    const db = await getDb();
    const result = await db.query(
      `INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, license_number, license_category, license_expiry_date, contact_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create driver' });
  }
};

module.exports = { getDrivers, createDriver };
