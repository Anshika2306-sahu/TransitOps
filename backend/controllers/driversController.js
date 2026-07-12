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

const driverLogin = async (req, res) => {
  const { license_number } = req.body;
  try {
    const db = await getDb();
    
    // Hackathon Demo Mode: Bypass validation and find ANY active trip
    const tripRes = await db.query(`
      SELECT vehicle_id FROM trips 
      WHERE status = 'On Trip' OR status = 'Dispatched'
      ORDER BY start_time DESC LIMIT 1
    `);

    if (tripRes.rows.length === 0) {
      return res.status(403).json({ error: 'No active dispatch found. Please dispatch a trip on the Dashboard first.' });
    }

    res.json({ vehicle_id: tripRes.rows[0].vehicle_id, driver_name: 'Demo Driver' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { getDrivers, createDriver, driverLogin };
