const StudyPlan = require('../../models/StudyPlan');
const { STUDY_PLANNER_PROMPT } = require('../prompts/studyPlanner.prompt');
const { getUserLearningProfile } = require('./progress.service');
const { generateStructuredResponse } = require('../utils/aiUtils');

const generateStudyPlan = async (userId, config) => {
  const { examDate, subjects, availableHours } = config;
  const learningProfile = await getUserLearningProfile(userId);

  const subjectsStr = Array.isArray(subjects) ? subjects.join(', ') : subjects;

  let prompt = STUDY_PLANNER_PROMPT
    .replace('{learningProfile}', learningProfile)
    .replace('{subjects}', subjectsStr)
    .replace('{examDate}', examDate || 'Not specified')
    .replace('{availableHours}', availableHours || 'Not specified');

  const validator = (data) => {
    if (!data.title && !data.dailyTasks && !data.revisionTasks) {
       throw new Error("Missing required schema fields (title, dailyTasks, revisionTasks)");
    }
  };

  const parsedData = await generateStructuredResponse(prompt, validator, 'object');

  const plan = await StudyPlan.create({
    owner: userId,
    title: parsedData.title || 'Study Plan',
    goal: parsedData.goal || '',
    totalDuration: parsedData.totalDuration || '',
    examDate: examDate ? new Date(examDate) : null,
    subjects: Array.isArray(subjects) ? subjects : [subjects],
    availableHoursPerWeek: Number(availableHours) || 0,
    dailyTasks: Array.isArray(parsedData.dailyTasks) ? parsedData.dailyTasks : [],
    revisionTasks: Array.isArray(parsedData.revisionTasks) ? parsedData.revisionTasks : []
  });

  return plan;
};

module.exports = { generateStudyPlan };
