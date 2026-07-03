import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studyPlanApi } from '../../services/studyPlanApi';
import { Map, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

const StudyPlanListPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Modal State
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState('');
  const [availableHours, setAvailableHours] = useState('10');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await studyPlanApi.getStudyPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjects.trim()) return;
    
    try {
      setGenerating(true);
      const newPlan = await studyPlanApi.generateStudyPlan({
        examDate,
        subjects: subjects.split(',').map(s => s.trim()),
        availableHours
      });
      setShowModal(false);
      navigate(`/study-plans/${newPlan._id}`);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this study plan?')) {
      try {
        await studyPlanApi.deleteStudyPlan(id);
        setPlans(plans.filter(p => p._id !== id));
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading plans...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
            <Map className="text-primary" size={32} />
            Study Plans
          </h1>
          <p className="text-slate-500 mt-2">Personalized roadmaps driven by your learning profile.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Generate Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <Map className="text-slate-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Plans Yet</h2>
          <p className="text-slate-500 mb-6">Generate your first AI-driven study plan to get started.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Generate Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const allTasks = [...(plan.dailyTasks || []), ...(plan.revisionTasks || [])];
            const completedCount = allTasks.filter(t => t.completionStatus).length;
            const progress = allTasks.length > 0 ? (completedCount / allTasks.length) * 100 : 0;
            
            return (
              <Link key={plan._id} to={`/study-plans/${plan._id}`} className="block group">
                <div className="glass-panel h-full p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {plan.totalDuration}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, plan._id)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2">
                    {plan.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {plan.goal}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                      <span>{completedCount} / {allTasks.length} Tasks</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Generate Study Plan</h2>
            <p className="text-slate-500 text-sm mb-6">Let AI create a personalized study schedule tailored to your exact constraints and historical learning data.</p>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subjects to Cover (comma separated)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Biology, Chemistry, Physics"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Available Study Hours (per week)
                </label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Exam Date (Optional)
                </label>
                <input 
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  disabled={generating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={generating}
                  className="btn-primary flex items-center gap-2"
                >
                  {generating ? (
                    <><Loader2 className="animate-spin" size={18} /> Generating...</>
                  ) : (
                    'Generate Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanListPage;
