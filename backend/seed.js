const { getDb } = require('./db');
(async () => {
  try {
    const db = await getDb();
    await db.query("INSERT INTO vehicles (registration_number, name_model, type, max_load_capacity, acquisition_cost, status) VALUES ('MH-01-AB-1234', 'Volvo FH16', 'Heavy Truck', 40000, 150000, 'Available')");
    await db.query("INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, status) VALUES ('Rajesh Kumar', 'DL-1234567890', 'Heavy Commercial', '2030-01-01', '9876543210', 'Available')");
    console.log('Seed data inserted successfully into Postgres.');
    process.exit(0);
  } catch (e) {
    console.log('Error seeding data:', e.message);
    process.exit(1);
  }
})();
