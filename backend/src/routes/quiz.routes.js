const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { generateQuiz, getQuizzes, getQuizById, submitAttempt, deleteQuiz } = require('../controllers/quiz.controller');

router.use(protect);

router.post('/generate', generateQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/attempt', submitAttempt);
router.delete('/:id', deleteQuiz);

module.exports = router;
