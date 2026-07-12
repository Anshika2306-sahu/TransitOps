const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('TransitOps API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const vehiclesRoutes = require('./routes/vehicles');
const tripsRoutes = require('./routes/trips');
const driversRoutes = require('./routes/drivers');
const maintenanceRoutes = require('./routes/maintenance');
const accidentsRoutes = require('./routes/accidents');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/accidents', accidentsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
