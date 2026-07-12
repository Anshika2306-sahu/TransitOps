const { getDb } = require('../db');

const getLogs = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT m.*, v.registration_number, v.name_model 
      FROM maintenance_logs m 
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
};

const createLog = async (req, res) => {
  const { vehicle_id, description, cost, date } = req.body;
  let client;
  try {
    const db = await getDb();
    client = await db.connect();
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, description, cost, date, status) 
       VALUES ($1, $2, $3, $4, 'Open') RETURNING *`,
      [vehicle_id, description, cost, date]
    );
    
    await client.query(`UPDATE vehicles SET status = 'In Shop' WHERE id = $1`, [vehicle_id]);
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create log' });
  } finally {
    if (client) client.release();
  }
};

const closeLog = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    const db = await getDb();
    client = await db.connect();
    
    const logRes = await client.query('SELECT vehicle_id, status FROM maintenance_logs WHERE id = $1', [id]);
    const log = logRes.rows[0];
    if (!log || log.status === 'Closed') return res.status(400).json({ error: 'Log invalid or already closed' });

    await client.query('BEGIN');
    await client.query(`UPDATE maintenance_logs SET status = 'Closed' WHERE id = $1`, [id]);
    await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [log.vehicle_id]);
    await client.query('COMMIT');

    res.json({ message: 'Log closed successfully' });
  } catch (err) {
    console.error(err);
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to close log' });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getLogs, createLog, closeLog };
