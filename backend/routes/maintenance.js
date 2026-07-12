const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, maintenanceController.getLogs);
router.post('/', authenticateToken, maintenanceController.createLog);
router.put('/:id/close', authenticateToken, maintenanceController.closeLog);

module.exports = router;
