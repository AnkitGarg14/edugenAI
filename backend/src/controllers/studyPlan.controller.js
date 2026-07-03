const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../ai/services/studyPlannerService');

const createStudyPlan = async (req, res, next) => {
  try {
    const { examDate, subjects, availableHours } = req.body;
    
    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'At least one subject is required' });
    }

    const config = { examDate, subjects, availableHours };
    const plan = await generateStudyPlan(req.user._id, config);
    
    res.status(201).json(plan);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getStudyPlans = async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getStudyPlanById = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, owner: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Study Plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId, isRevision, completionStatus } = req.body;
    
    const plan = await StudyPlan.findOne({ _id: req.params.id, owner: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Study Plan not found' });
    }

    let task;
    if (isRevision) {
      task = plan.revisionTasks.id(taskId);
    } else {
      task = plan.dailyTasks.id(taskId);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completionStatus = completionStatus;
    await plan.save();

    res.status(200).json(plan);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const deleteStudyPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Study Plan not found' });
    }
    res.status(200).json({ message: 'Study Plan deleted' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateTaskStatus,
  deleteStudyPlan
};
