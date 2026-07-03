const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: String,
  estimatedStudyTime: String, // e.g., "2 hours"
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  completionStatus: { type: Boolean, default: false },
  notes: String,
});

const studyPlanSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  goal: String,
  totalDuration: String,
  examDate: Date,
  subjects: [String],
  availableHoursPerWeek: Number,
  dailyTasks: [taskSchema],
  revisionTasks: [taskSchema],
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
