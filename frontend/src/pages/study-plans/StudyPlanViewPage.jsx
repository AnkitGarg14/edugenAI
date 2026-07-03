import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyPlanApi } from '../../services/studyPlanApi';
import { ArrowLeft, CheckCircle2, Circle, Clock, Map, Target, AlertCircle, Check } from 'lucide-react';
import { useStudySession } from '../../hooks/useStudySession';

const TaskItem = ({ task, isRevision, onToggle }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div 
      className={`glass-panel p-4 mb-3 flex items-start gap-4 transition-all duration-300 cursor-pointer ${task.completionStatus ? 'opacity-60 grayscale' : 'hover:border-primary/50 hover:shadow-md'}`}
      onClick={() => onToggle(task._id, isRevision, !task.completionStatus)}
    >
      <button className={`mt-1 flex-shrink-0 transition-colors ${task.completionStatus ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}>
        {task.completionStatus ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-base font-bold ${task.completionStatus ? 'line-through text-slate-500' : 'text-light-text dark:text-dark-text'}`}>
            {task.topic}
          </h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
          <span className="flex items-center gap-1"><Clock size={14} /> {task.estimatedStudyTime}</span>
        </div>

        {task.notes && (
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
            {task.notes}
          </div>
        )}
      </div>
    </div>
  );
};

const StudyPlanViewPage = () => {
  useStudySession('Planner');
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const data = await studyPlanApi.getStudyPlanById(id);
      setPlan(data);
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, isRevision, currentStatus) => {
    // Optimistic UI update
    const updatedPlan = { ...plan };
    const taskList = isRevision ? updatedPlan.revisionTasks : updatedPlan.dailyTasks;
    const taskIndex = taskList.findIndex(t => t._id === taskId);
    if (taskIndex > -1) {
      taskList[taskIndex].completionStatus = currentStatus;
      setPlan(updatedPlan);
    }

    try {
      await studyPlanApi.updateTaskStatus(plan._id, taskId, isRevision, currentStatus);
    } catch (error) {
      console.error('Failed to update task', error);
      // Revert on failure (simplified)
      fetchPlan(); 
    }
  };

  if (loading) return <div className="p-8 text-center">Loading study plan...</div>;
  if (!plan) return <div className="p-8 text-center text-rose-500">Study Plan not found.</div>;

  const allTasks = [...(plan.dailyTasks || []), ...(plan.revisionTasks || [])];
  const completedCount = allTasks.filter(t => t.completionStatus).length;
  const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header Info */}
      <button 
        onClick={() => navigate('/study-plans')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Plans
      </button>

      <div className="glass-panel p-6 md:p-8 mb-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
          <Map size={300} />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">{plan.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 flex items-start gap-2">
            <Target className="text-primary mt-1 shrink-0" size={20} />
            {plan.goal}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Total Duration</div>
              <div className="font-bold text-light-text dark:text-dark-text">{plan.totalDuration}</div>
            </div>
            <div className="bg-white/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Hours/Week</div>
              <div className="font-bold text-light-text dark:text-dark-text">{plan.availableHoursPerWeek} hrs</div>
            </div>
            <div className="bg-white/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Exam Date</div>
              <div className="font-bold text-light-text dark:text-dark-text">
                {plan.examDate ? new Date(plan.examDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Subjects</div>
              <div className="font-bold text-light-text dark:text-dark-text line-clamp-1" title={plan.subjects.join(', ')}>
                {plan.subjects.join(', ')}
              </div>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-2">
              <span className="text-slate-600 dark:text-slate-300">Overall Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Tasks */}
        <div>
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
            <Check className="text-primary" /> Learning Tasks
          </h2>
          {plan.dailyTasks && plan.dailyTasks.length > 0 ? (
            plan.dailyTasks.map(task => (
              <TaskItem 
                key={task._id} 
                task={task} 
                isRevision={false} 
                onToggle={handleToggleTask} 
              />
            ))
          ) : (
            <div className="p-4 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No learning tasks generated.
            </div>
          )}
        </div>

        {/* Revision Tasks */}
        <div>
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500" /> Revision Schedule
          </h2>
          {plan.revisionTasks && plan.revisionTasks.length > 0 ? (
            plan.revisionTasks.map(task => (
              <TaskItem 
                key={task._id} 
                task={task} 
                isRevision={true} 
                onToggle={handleToggleTask} 
              />
            ))
          ) : (
            <div className="p-4 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No revision tasks generated.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default StudyPlanViewPage;
