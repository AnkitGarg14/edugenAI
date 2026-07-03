const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { analyze } = require('../controllers/codingCoach.controller');

router.use(protect);

router.post('/analyze', analyze);

module.exports = router;
