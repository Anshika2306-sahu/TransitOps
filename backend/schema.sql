CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  name_model VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  max_load_capacity DECIMAL(10, 2) NOT NULL,
  acquisition_cost DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Available',
  current_lat DECIMAL(10, 6),
  current_lng DECIMAL(10, 6),
  is_sos_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_category VARCHAR(20) NOT NULL,
  license_expiry_date DATE NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  cargo_weight DECIMAL(10, 2) NOT NULL,
  planned_distance DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Dispatched',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  description TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  expense_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
