const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

// Ana GET rotası: http://localhost:5000/
router.get('/', alumniController.getAlumni);

module.exports = router;
