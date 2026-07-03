const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  averageScore: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['weak', 'average', 'strong'],
    required: true,
    default: 'average'
  },
  attempts: [{
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Ensure one progress doc per user per topic
topicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('TopicProgress', topicProgressSchema);
