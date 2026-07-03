const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  topic: {
    type: String,
    required: true,
  },
  quizType: {
    type: String,
    default: 'mixed' // mixed, mcq, true_false, fill_blank, short_answer
  },
  difficulty: {
    type: String,
    default: 'medium' // easy, medium, hard
  },
  questions: [{
    type: { type: String, enum: ['mcq', 'true_false', 'fill_blank', 'short_answer'] },
    questionText: String,
    options: [String], // for mcq and true_false
    correctAnswer: String, // The string or index of the correct answer
    explanation: String
  }],
  attempts: [{
    score: Number,
    totalQuestions: Number,
    answers: mongoose.Schema.Types.Mixed, // stores user's provided answers
    date: { type: Date, default: Date.now }
  }],
  generatedContent: {
    type: String,
    description: 'Fallback or raw markdown if structured parsing fails'
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
