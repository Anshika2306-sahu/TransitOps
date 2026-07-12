const express = require('express');
const router = express.Router();
const driversController = require('../controllers/driversController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, driversController.getDrivers);
router.post('/', authenticateToken, driversController.createDriver);
router.post('/login', driversController.driverLogin);

module.exports = router;
