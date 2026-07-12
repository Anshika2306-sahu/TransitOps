const express = require('express');
const router = express.Router();
const accidentsController = require('../controllers/accidentsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, accidentsController.getAccidents);
router.post('/', authenticateToken, accidentsController.reportAccident);

module.exports = router;
