const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController.js');

router.post('/analyze', analysisController.analyzeImage);

router.get('/analyses', analysisController.getAnalyses);

module.exports = router;