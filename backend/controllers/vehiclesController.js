const { getDb } = require('../db');

const getVehicles = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

const createVehicle = async (req, res) => {
  const { registration_number, name_model, type, max_load_capacity, acquisition_cost } = req.body;
  try {
    const db = await getDb();
    const result = await db.query(
      `INSERT INTO vehicles (registration_number, name_model, type, max_load_capacity, acquisition_cost) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [registration_number, name_model, type, max_load_capacity, acquisition_cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

const updateVehicleLocation = async (req, res) => {
  const { id } = req.params;
  const { current_lat, current_lng } = req.body;
  try {
    const db = await getDb();
    const result = await db.query(
      `UPDATE vehicles SET current_lat = $1, current_lng = $2 WHERE id = $3 RETURNING *`,
      [current_lat, current_lng, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

const triggerSOS = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    const db = await getDb();
    client = await db.connect();
    await client.query('BEGIN');

    const vehicleRes = await client.query(`UPDATE vehicles SET is_sos_active = TRUE WHERE id = $1 RETURNING *`, [id]);
    if (vehicleRes.rows.length === 0) throw new Error('Vehicle not found');
    const vehicle = vehicleRes.rows[0];

    const tripRes = await client.query(`
      SELECT driver_id FROM trips 
      WHERE vehicle_id = $1 AND status = 'Dispatched' 
      ORDER BY start_time DESC LIMIT 1
    `, [id]);
    
    const driver_id = tripRes.rows.length > 0 ? tripRes.rows[0].driver_id : null;

    await client.query(`
      INSERT INTO accidents (vehicle_id, driver_id, location_lat, location_lng, description)
      VALUES ($1, $2, $3, $4, 'EMERGENCY SOS TRIGGERED')
    `, [id, driver_id, vehicle.current_lat, vehicle.current_lng]);

    await client.query('COMMIT');
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to trigger SOS' });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getVehicles, createVehicle, updateVehicleLocation, triggerSOS };
