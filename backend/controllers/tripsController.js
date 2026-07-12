const { getDb } = require('../db');

const getTrips = async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT t.*, v.registration_number, d.name AS driver_name 
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.id DESC
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

const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const db = await getDb();
    
    // If completed, use the proper complete logic to free vehicles
    if (status === 'Completed') {
      const tripRes = await db.query('SELECT vehicle_id, driver_id FROM trips WHERE id = $1', [id]);
      if (tripRes.rows[0]) {
        await db.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [tripRes.rows[0].vehicle_id]);
        await db.query(`UPDATE drivers SET status = 'Available' WHERE id = $1`, [tripRes.rows[0].driver_id]);
      }
    } else if (status === 'On Trip' || status === 'Dispatched') {
       const tripRes = await db.query('SELECT vehicle_id, driver_id FROM trips WHERE id = $1', [id]);
       if (tripRes.rows[0]) {
        await db.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [tripRes.rows[0].vehicle_id]);
        await db.query(`UPDATE drivers SET status = 'On Trip' WHERE id = $1`, [tripRes.rows[0].driver_id]);
       }
    }
    
    const result = await db.query(
      `UPDATE trips SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update trip status' });
  }
};

const updateTrip = async (req, res) => {
  const { id } = req.params;
  const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance } = req.body;
  
  let client;
  try {
    const db = await getDb();
    client = await db.connect();
    await client.query('BEGIN');

    // Get current trip details
    const tripRes = await client.query('SELECT * FROM trips WHERE id = $1', [id]);
    const currentTrip = tripRes.rows[0];
    if (!currentTrip) throw new Error('Trip not found');

    // If vehicle changed, validate new vehicle
    if (vehicle_id && vehicle_id != currentTrip.vehicle_id) {
      const vRes = await client.query('SELECT status, max_load_capacity FROM vehicles WHERE id = $1 FOR UPDATE', [vehicle_id]);
      const newVehicle = vRes.rows[0];
      if (!newVehicle || newVehicle.status !== 'Available') throw new Error('New vehicle is not available');
      if (parseFloat(cargo_weight || currentTrip.cargo_weight) > newVehicle.max_load_capacity) {
        throw new Error(`Cargo weight exceeds new vehicle capacity of ${newVehicle.max_load_capacity} kg`);
      }
      // Free old vehicle
      await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [currentTrip.vehicle_id]);
      // Lock new vehicle
      await client.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [vehicle_id]);
    }

    // If driver changed, validate new driver
    if (driver_id && driver_id != currentTrip.driver_id) {
      const dRes = await client.query('SELECT status FROM drivers WHERE id = $1 FOR UPDATE', [driver_id]);
      const newDriver = dRes.rows[0];
      if (!newDriver || newDriver.status !== 'Available') throw new Error('New driver is already assigned to another trip');
      // Free old driver
      await client.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [currentTrip.driver_id]);
      // Lock new driver
      await client.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [driver_id]);
    }

    const result = await client.query(
      `UPDATE trips 
       SET vehicle_id = COALESCE($1, vehicle_id), 
           driver_id = COALESCE($2, driver_id), 
           source = COALESCE($3, source), 
           destination = COALESCE($4, destination), 
           cargo_weight = COALESCE($5, cargo_weight), 
           planned_distance = COALESCE($6, planned_distance)
       WHERE id = $7 RETURNING *`,
      [vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  getTrips,
  dispatchTrip,
  completeTrip,
  updateTripStatus,
  updateTrip
};
