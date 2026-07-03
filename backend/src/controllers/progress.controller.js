const TopicProgress = require('../models/TopicProgress');
const StudySession = require('../models/StudySession');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Chat = require('../models/Chat');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

const getProgress = async (req, res, next) => {
  try {
    const progress = await TopicProgress.find({ user: req.user._id }).sort({ averageScore: 1 });
    
    const weakTopics = progress
      .filter(p => p.status === 'weak')
      .map(p => ({ name: p.topic, score: Math.round(p.averageScore) }))
      .slice(0, 5); 

    const strongTopics = progress
      .filter(p => p.status === 'strong')
      .map(p => ({ name: p.topic, score: Math.round(p.averageScore) }))
      .slice(0, 5);

    res.status(200).json({
      weakTopics,
      strongTopics
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const startSession = async (req, res, next) => {
  try {
    const { activityType } = req.body;
    const session = await StudySession.create({
      user: req.user._id,
      activityType
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await StudySession.findOne({ _id: sessionId, user: req.user._id });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.endTime) {
      session.endTime = new Date();
      session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000);
      await session.save();

    // res.status(200).json(session);
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalDocuments = await Document.countDocuments({ owner: userId });
    const totalFlashcardDecks = await Flashcard.countDocuments({ owner: userId });
    const totalChats = await Chat.countDocuments({ owner: userId });

    const quizzes = await Quiz.find({ owner: userId });
    let totalAttempts = 0;
    let totalScorePercents = 0;
    
    quizzes.forEach(q => {
      totalAttempts += q.attempts.length;
      q.attempts.forEach(a => {
        if (a.totalQuestions > 0) {
          totalScorePercents += (a.score / a.totalQuestions) * 100;
        }
      });
    });
    
    const avgQuizScore = totalAttempts > 0 ? Math.round(totalScorePercents / totalAttempts) : 0;

    // Study Sessions Analysis
    const sessions = await StudySession.find({ user: userId }).sort({ startTime: 1 });
    
    // Weekly Study Hours (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(s => s.startTime >= sevenDaysAgo);
    const weeklyStudySeconds = recentSessions.reduce((acc, curr) => acc + curr.duration, 0);
    const weeklyStudyHours = (weeklyStudySeconds / 3600).toFixed(1);

    // Calculate Streak (Consecutive days with at least 1 session)
    let streak = 0;
    if (sessions.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      const uniqueActiveDates = [...new Set(sessions.map(s => {
        const d = new Date(s.startTime);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a); // descending

      if (uniqueActiveDates.length > 0) {
        // Check if active today or yesterday to maintain streak
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffToMostRecent = (currentDate.getTime() - uniqueActiveDates[0]) / msPerDay;
        
        if (diffToMostRecent <= 1) {
          streak = 1;
          for (let i = 0; i < uniqueActiveDates.length - 1; i++) {
            const diff = (uniqueActiveDates[i] - uniqueActiveDates[i+1]) / msPerDay;
            if (diff === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
    }

    // Chart Data (Last 7 days breakdown)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const daySessions = sessions.filter(s => s.startTime >= d && s.startTime < nextD);
      const dayHours = (daySessions.reduce((acc, curr) => acc + curr.duration, 0) / 3600).toFixed(1);

      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: parseFloat(dayHours)
      });
    }

    // Weak/Strong Topics
    const progress = await TopicProgress.find({ user: userId }).sort({ averageScore: 1 });
    const weakTopics = progress.filter(p => p.status === 'weak').map(p => ({ name: p.topic, score: Math.round(p.averageScore) })).slice(0, 5);
    const strongTopics = progress.filter(p => p.status === 'strong').map(p => ({ name: p.topic, score: Math.round(p.averageScore) })).slice(0, 5);

    res.status(200).json({
      totalDocuments,
      totalFlashcardDecks,
      totalChats,
      avgQuizScore,
      weeklyStudyHours,
      streak,
      chartData,
      weakTopics,
      strongTopics
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  getProgress,
  startSession,
  endSession,
  getDashboardStats
};
