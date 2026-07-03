const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['Chat', 'Quiz', 'Flashcards', 'Planner', 'Document'],
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // in seconds
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
