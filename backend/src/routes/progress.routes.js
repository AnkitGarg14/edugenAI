const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getProgress, startSession, endSession, getDashboardStats } = require('../controllers/progress.controller');

router.use(protect);

router.get('/', getProgress);
router.get('/dashboard', getDashboardStats);
router.post('/sessions', startSession);
router.put('/sessions/:sessionId/end', endSession);

module.exports = router;
