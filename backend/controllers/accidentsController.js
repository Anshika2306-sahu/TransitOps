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

module.exports = { getAccidents };
