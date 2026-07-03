const Quiz = require('../models/Quiz');
const TopicProgress = require('../models/TopicProgress');
const { generateQuiz: generateQuizService } = require('../ai/services/quizService');

const generateQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty, numQuestions, quizType, documentIds } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const config = { numQuestions, difficulty, topic, documentIds, quizType };
    const quiz = await generateQuizService(req.user._id, config);
    
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions'); // Omit questions in the list view for performance
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, owner: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { score, totalQuestions, answers } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.id, owner: req.user._id });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.attempts.push({
      score,
      totalQuestions,
      answers,
      date: new Date()
    });

    await quiz.save();

    // Adaptive Learning Engine: Update TopicProgress
    if (totalQuestions > 0) {
      const percentage = (score / totalQuestions) * 100;
      
      let topicProgress = await TopicProgress.findOne({ user: req.user._id, topic: quiz.topic });
      
      if (!topicProgress) {
        topicProgress = new TopicProgress({
          user: req.user._id,
          topic: quiz.topic,
          attempts: [],
        });
      }

      topicProgress.attempts.push({
        score,
        totalQuestions,
        percentage,
        quizId: quiz._id
      });

      // Calculate new average
      const totalPercentage = topicProgress.attempts.reduce((sum, att) => sum + att.percentage, 0);
      topicProgress.averageScore = totalPercentage / topicProgress.attempts.length;

      // Determine status
      if (topicProgress.averageScore < 50) {
        topicProgress.status = 'weak';
      } else if (topicProgress.averageScore > 80) {
        topicProgress.status = 'strong';
      } else {
        topicProgress.status = 'average';
      }

      await topicProgress.save();
    }

    res.status(200).json({ message: 'Attempt saved successfully', attempt: quiz.attempts[quiz.attempts.length - 1] });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitAttempt,
  deleteQuiz
};
