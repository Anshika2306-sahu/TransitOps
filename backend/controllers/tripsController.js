const { getDb } = require('../db');

const getTrips = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT t.*, v.registration_number, d.name AS driver_name 
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

const dispatchTrip = async (req, res) => {
  const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance } = req.body;
  let client;
  
  try {
    const db = await getDb();
    client = await db.connect();
    await client.query('BEGIN');

    const vehicleRes = await client.query('SELECT status, max_load_capacity FROM vehicles WHERE id = $1', [vehicle_id]);
    const vehicle = vehicleRes.rows[0];
    if (!vehicle || vehicle.status !== 'Available') {
      throw new Error('Vehicle is not available');
    }
    if (parseFloat(cargo_weight) > vehicle.max_load_capacity) {
      throw new Error('Cargo weight exceeds vehicle capacity');
    }

    const tripRes = await client.query(
      `INSERT INTO trips (vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Dispatched') RETURNING *`,
      [vehicle_id, driver_id, source, destination, cargo_weight, planned_distance]
    );

    await client.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [vehicle_id]);
    await client.query(`UPDATE drivers SET status = 'On Trip' WHERE id = $1`, [driver_id]);

    await client.query('COMMIT');
    res.status(201).json(tripRes.rows[0]);
  } catch (err) {
    console.error(err);
    if (client) await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Failed to dispatch trip' });
  } finally {
    if (client) client.release();
  }
};

const completeTrip = async (req, res) => {
  const { id } = req.params;
  const { expense_amount, expense_desc } = req.body;
  let client;

  try {
    const db = await getDb();
    client = await db.connect();
    await client.query('BEGIN');

    const tripRes = await client.query('SELECT vehicle_id, driver_id, status FROM trips WHERE id = $1', [id]);
    const trip = tripRes.rows[0];
    if (!trip || trip.status === 'Completed') {
      throw new Error('Trip not found or already completed');
    }

    await client.query(`UPDATE trips SET status = 'Completed', end_time = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
    await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [trip.vehicle_id]);
    await client.query(`UPDATE drivers SET status = 'Available' WHERE id = $1`, [trip.driver_id]);

    if (expense_amount) {
      await client.query(
        `INSERT INTO expenses (trip_id, vehicle_id, expense_type, amount, description) VALUES ($1, $2, 'Trip Expense', $3, $4)`,
        [id, trip.vehicle_id, expense_amount, expense_desc]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Trip completed successfully' });
  } catch (err) {
    console.error(err);
    if (client) await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Failed to complete trip' });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getTrips, dispatchTrip, completeTrip };
