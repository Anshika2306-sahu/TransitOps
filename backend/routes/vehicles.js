const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehiclesController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, vehiclesController.getVehicles);
router.post('/', authenticateToken, vehiclesController.createVehicle);
router.put('/:id/location', vehiclesController.updateVehicleLocation);
router.post('/:id/sos', vehiclesController.triggerSOS);

module.exports = router;
