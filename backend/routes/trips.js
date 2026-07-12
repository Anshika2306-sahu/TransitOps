const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, tripsController.getTrips);
router.post('/dispatch', authenticateToken, tripsController.dispatchTrip);
router.post('/:id/complete', authenticateToken, tripsController.completeTrip);
router.put('/:id/status', authenticateToken, tripsController.updateTripStatus);
router.put('/:id', authenticateToken, tripsController.updateTrip);

module.exports = router;
