import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';
import { BookOpen, BrainCircuit, Calendar, Trash2, ArrowRight, Plus, X, Loader2 } from 'lucide-react';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [config, setConfig] = useState({
    topic: '',
    quizType: 'mixed',
    difficulty: 'medium',
    numQuestions: 10
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent link click
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizApi.deleteQuiz(id);
        setQuizzes(quizzes.filter(q => q._id !== id));
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (!config.topic.trim()) return;
    
    try {
      setGenerating(true);
      const newQuiz = await quizApi.generateQuiz(config);
      setQuizzes([newQuiz, ...quizzes]);
      setShowModal(false);
      navigate(`/quizzes/${newQuiz._id}`);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const allAttempts = [];
  quizzes.forEach(quiz => {
    if (quiz.attempts && quiz.attempts.length > 0) {
      quiz.attempts.forEach((attempt, index) => {
        allAttempts.push({
          ...attempt,
          quizId: quiz._id,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          attemptIndex: index
        });
      });
    }
  });

  allAttempts.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your quizzes...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
            <BrainCircuit className="text-primary" size={32} />
            My Quizzes
          </h1>
          <p className="text-slate-500 mt-2">Review your past quizzes and generate new ones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Generate Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Quizzes Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Generate quizzes using the AI Tutor to test your knowledge on any topic.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Generate Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const bestScore = quiz.attempts && quiz.attempts.length > 0 
              ? Math.max(...quiz.attempts.map(a => a.score))
              : null;
            
            return (
              <Link key={quiz._id} to={`/quizzes/${quiz._id}`} className="block group">
                <div className="glass-panel h-full p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                        {quiz.quizType === 'mixed' ? 'Mixed' : quiz.quizType}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        quiz.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        quiz.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, quiz._id)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2">
                    {quiz.topic}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                      <Calendar size={14} />
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                    {bestScore !== null ? (
                      <div className="font-semibold text-emerald-500">
                        Score: {bestScore}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Take Quiz <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Previous Attempts Section */}
      {allAttempts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-primary" size={28} />
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Previous Attempts
            </h2>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-slate-500 text-sm">
                    <th className="py-4 px-6 font-medium">Topic</th>
                    <th className="py-4 px-6 font-medium">Difficulty</th>
                    <th className="py-4 px-6 font-medium">Score</th>
                    <th className="py-4 px-6 font-medium">Date</th>
                    <th className="py-4 px-6 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {allAttempts.map((attempt, idx) => {
                    const percentage = attempt.totalQuestions > 0 ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
                    return (
                      <tr key={`${attempt.quizId}-${attempt.attemptIndex}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-light-text dark:text-dark-text">
                          {attempt.topic}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            attempt.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                            attempt.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {attempt.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {percentage}%
                            </span>
                            <span className="text-slate-500 text-sm">
                              ({attempt.score}/{attempt.totalQuestions})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {new Date(attempt.date).toLocaleDateString()} {new Date(attempt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link 
                            to={`/quizzes/${attempt.quizId}/result?attemptIndex=${attempt.attemptIndex}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                          >
                            View Result <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                Generate Quiz
              </h2>
              <button onClick={() => !generating && setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input 
                  type="text" 
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="E.g., Quantum Physics, French Revolution..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  disabled={generating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quiz Type</label>
                <select 
                  value={config.quizType} 
                  onChange={(e) => setConfig({...config, quizType: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  disabled={generating}
                >
                  <option value="mixed">Mixed Quiz (Default)</option>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True / False</option>
                  <option value="fill_blank">Fill in the Blanks</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select 
                    value={config.difficulty} 
                    onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    disabled={generating}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Questions</label>
                  <select 
                    value={config.numQuestions} 
                    onChange={(e) => setConfig({...config, numQuestions: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    disabled={generating}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => setShowModal(false)}
                disabled={generating}
                className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generating || !config.topic.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating...</>
                ) : (
                  <><BrainCircuit size={18} /> Generate</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
