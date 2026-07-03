const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { 
  createStudyPlan, 
  getStudyPlans, 
  getStudyPlanById, 
  updateTaskStatus, 
  deleteStudyPlan 
} = require('../controllers/studyPlan.controller');

router.use(protect);

router.post('/generate', createStudyPlan);
router.get('/', getStudyPlans);
router.get('/:id', getStudyPlanById);
router.put('/:id/tasks', updateTaskStatus);
router.delete('/:id', deleteStudyPlan);

module.exports = router;
