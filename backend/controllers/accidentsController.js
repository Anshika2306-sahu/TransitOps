const { getDb } = require('../db');

const getAccidents = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT a.*, v.registration_number, v.name_model, d.name AS driver_name
      FROM accidents a
      JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN drivers d ON a.driver_id = d.id
      ORDER BY a.timestamp DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accidents' });
  }
};

const reportAccident = async (req, res) => {
  const { vehicle_id, description, location_lat, location_lng } = req.body;
  try {
    const db = await getDb();
    const result = await db.query(
      `INSERT INTO accidents (vehicle_id, description, location_lat, location_lng, timestamp) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [vehicle_id, description || 'SOS ALERT - Driver triggered emergency panic button!', location_lat, location_lng]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to report accident' });
  }
};

module.exports = { getAccidents, reportAccident };
