const express = require('express');
const router = express.Router();
const accidentsController = require('../controllers/accidentsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, accidentsController.getAccidents);

module.exports = router;
