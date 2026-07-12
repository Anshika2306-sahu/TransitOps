const { getDb } = require('./db');

(async () => {
  try {
    const db = await getDb();
    console.log('Connected to Supabase Postgres. Clearing old data...');
    await db.query("TRUNCATE TABLE expenses, maintenance_logs, trips, drivers, vehicles RESTART IDENTITY CASCADE");

    const indianCities = [
      { name: "Mumbai, MH", lat: 19.0760, lng: 72.8777 },
      { name: "Delhi, DL", lat: 28.7041, lng: 77.1025 },
      { name: "Bangalore, KA", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai, TN", lat: 13.0827, lng: 80.2707 },
      { name: "Kolkata, WB", lat: 22.5726, lng: 88.3639 },
      { name: "Pune, MH", lat: 18.5204, lng: 73.8567 },
      { name: "Ahmedabad, GJ", lat: 23.0225, lng: 72.5714 },
      { name: "Jaipur, RJ", lat: 26.9124, lng: 75.7873 },
      { name: "Surat, GJ", lat: 21.1702, lng: 72.8311 },
      { name: "Lucknow, UP", lat: 26.8467, lng: 80.9462 },
      { name: "Kanpur, UP", lat: 26.4499, lng: 80.3319 },
      { name: "Nagpur, MH", lat: 21.1458, lng: 79.0882 },
      { name: "Indore, MP", lat: 22.7196, lng: 75.8577 },
      { name: "Thane, MH", lat: 19.2183, lng: 72.9781 },
      { name: "Bhopal, MP", lat: 23.2599, lng: 77.4126 },
      { name: "Visakhapatnam, AP", lat: 17.6868, lng: 83.2185 },
      { name: "Patna, BR", lat: 25.5941, lng: 85.1376 },
      { name: "Vadodara, GJ", lat: 22.3072, lng: 73.1812 },
      { name: "Ghaziabad, UP", lat: 28.6692, lng: 77.4538 },
      { name: "Ludhiana, PB", lat: 30.9010, lng: 75.8523 }
    ];

    const vehicleModels = ["Volvo FH16", "Tata Prima", "Ashok Leyland Captain", "Mahindra Blazo", "Eicher Pro", "BharatBenz 2823C", "Tata Signa", "SML Isuzu", "AMW 2518", "Force Traveller"];
    const vehicleTypes = ["Heavy Truck", "Medium Truck", "Light Truck"];
    const vehicleStatuses = ["Available", "On Trip", "In Shop", "Available", "On Trip", "Available"];
    const driverStatuses = ["Available", "On Trip", "Off Duty", "Available", "On Trip", "Available"];
    const firstNames = ["Rajesh", "Amit", "Vikram", "Suresh", "Manoj", "Anil", "Rahul", "Priya", "Neha", "Ravi", "Sanjay", "Vijay", "Ajay", "Deepak", "Sunil"];
    const lastNames = ["Kumar", "Singh", "Patel", "Menon", "Desai", "Sharma", "Verma", "Gupta", "Rao", "Reddy", "Nair", "Pillai", "Das", "Bose", "Ghosh"];
    const maintenanceDescs = ["Engine Overhaul", "Oil Change", "Brake Pad Replacement", "Tire Alignment", "Transmission Repair", "AC Servicing", "Battery Replacement", "Suspension Check"];

    console.log('Generating 30 Vehicles...');
    let vehicles = [];
    for (let i = 1; i <= 30; i++) {
      const reg = `MH-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}-AB-${String(1000 + i)}`;
      const model = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
      const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const capacity = Math.floor(Math.random() * 30000) + 10000;
      const cost = Math.floor(Math.random() * 2000000) + 500000; // 5 Lakhs to 25 Lakhs INR
      const status = vehicleStatuses[Math.floor(Math.random() * vehicleStatuses.length)];
      const city = indianCities[Math.floor(Math.random() * indianCities.length)];
      vehicles.push(`('${reg}', '${model}', '${type}', ${capacity}, ${cost}, '${status}', ${city.lat}, ${city.lng})`);
    }
    await db.query(`INSERT INTO vehicles (registration_number, name_model, type, max_load_capacity, acquisition_cost, status, current_lat, current_lng) VALUES ${vehicles.join(',')}`);

    console.log('Generating 30 Drivers...');
    let drivers = [];
    for (let i = 1; i <= 30; i++) {
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const lic = `DL-${String(Math.floor(Math.random() * 9999999999)).padStart(10, '0')}`;
      const status = driverStatuses[Math.floor(Math.random() * driverStatuses.length)];
      drivers.push(`('${name}', '${lic}', 'Heavy Commercial', '2030-01-01', '9876543210', '${status}')`);
    }
    await db.query(`INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, status) VALUES ${drivers.join(',')}`);

    console.log('Generating 30 Trips...');
    let trips = [];
    for (let i = 1; i <= 30; i++) {
      const v_id = i;
      const d_id = i;
      const src = indianCities[Math.floor(Math.random() * indianCities.length)].name;
      let dest = indianCities[Math.floor(Math.random() * indianCities.length)].name;
      while (dest === src) dest = indianCities[Math.floor(Math.random() * indianCities.length)].name;
      const weight = Math.floor(Math.random() * 20000) + 5000;
      const dist = Math.floor(Math.random() * 1500) + 100;
      const tripStatuses = ["Draft", "Dispatched", "On Trip", "Completed"];
      const status = tripStatuses[Math.floor(Math.random() * tripStatuses.length)];
      trips.push(`(${v_id}, ${d_id}, '${src}', '${dest}', ${weight}, ${dist}, '${status}', '2024-05-01 10:00:00')`);
    }
    await db.query(`INSERT INTO trips (vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, status, start_time) VALUES ${trips.join(',')}`);
    
    // Set end times for completed trips
    await db.query(`UPDATE trips SET end_time = '2024-05-02 18:00:00' WHERE status = 'Completed'`);

    console.log('Generating 30 Maintenance Logs...');
    let maintenance = [];
    for (let i = 1; i <= 30; i++) {
      const v_id = Math.floor(Math.random() * 30) + 1;
      const desc = maintenanceDescs[Math.floor(Math.random() * maintenanceDescs.length)];
      const cost = Math.floor(Math.random() * 50000) + 5000; // 5k to 55k INR
      maintenance.push(`(${v_id}, '${desc}', ${cost}, '2024-05-12', 'Completed')`);
    }
    await db.query(`INSERT INTO maintenance_logs (vehicle_id, description, cost, date, status) VALUES ${maintenance.join(',')}`);

    console.log('Database seeded with 30 entries each, priced in INR!');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e);
    process.exit(1);
  }
})();
