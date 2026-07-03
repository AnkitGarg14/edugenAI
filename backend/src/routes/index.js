const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const documentRoutes = require('./document.routes');
const aiRoutes = require('./ai.routes');
const quizRoutes = require('./quiz.routes');
const progressRoutes = require('./progress.routes');
const flashcardRoutes = require('./flashcard.routes');
const studyPlanRoutes = require('./studyPlan.routes');
const codingCoachRoutes = require('./codingCoach.routes');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/ai', aiRoutes);
router.use('/quizzes', quizRoutes);
router.use('/progress', progressRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/coding-coach', codingCoachRoutes);

module.exports = router;
