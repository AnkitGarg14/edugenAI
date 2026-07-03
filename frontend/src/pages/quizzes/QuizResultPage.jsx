import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, RotateCcw, BookOpen, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const QuizResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const data = await quizApi.getQuizById(id);
      setQuiz(data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading results...</div>;
  if (!quiz) return <div className="p-8 text-center text-rose-500">Quiz not found.</div>;

  let targetAttempt = null;
  if (quiz && quiz.attempts && quiz.attempts.length > 0) {
    const queryParams = new URLSearchParams(location.search);
    const attemptIndexStr = queryParams.get('attemptIndex');
    
    if (attemptIndexStr !== null) {
      const idx = parseInt(attemptIndexStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < quiz.attempts.length) {
        targetAttempt = quiz.attempts[idx];
      }
    }
    
    if (!targetAttempt) {
      targetAttempt = quiz.attempts[quiz.attempts.length - 1];
    }
  }

  if (!targetAttempt) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
        <AlertCircle size={32} className="mb-2 text-amber-500" />
        <p>No attempts found for this quiz.</p>
        <button 
          onClick={() => navigate(`/quizzes/${id}`)}
          className="mt-4 btn-primary"
        >
          Take Quiz Now
        </button>
      </div>
    );
  }

  const { score, totalQuestions, answers } = targetAttempt;
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24">
      <button 
        onClick={() => navigate('/quizzes')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Quizzes
      </button>

      <div className="glass-panel p-6 md:p-8 mb-8 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BrainCircuit size={120} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-2">
          {quiz.topic} - Results
        </h1>
        <p className="text-slate-500 mb-6">
          Review your performance below.
        </p>

        <div className="inline-block p-6 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-5xl font-black text-primary mb-2">
            {percentage}%
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            You scored {score} out of {totalQuestions}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => navigate(`/quizzes/${id}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} /> Retry Quiz
          </button>
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn-primary flex items-center gap-2"
          >
            <BookOpen size={18} /> Quiz Library
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
        Question Review
      </h2>

      <div className="space-y-6">
        {quiz.questions.map((q, index) => {
          const userAnswer = answers && answers[index] ? String(answers[index]) : '';
          const correctAnswer = String(q.correctAnswer).trim();
          const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();

          return (
            <div key={index} className={`glass-panel p-6 border-l-4 ${
              isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
            }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                  isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {index + 1}
                </div>
                <div className="pt-1 flex-1">
                  <div className="font-medium text-light-text dark:text-dark-text text-lg">
                    <ReactMarkdown>{q.questionText || ''}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Your Answer</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {userAnswer || '*Skipped*'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mb-1">Correct Answer</div>
                    <div className="font-medium text-emerald-700 dark:text-emerald-300">
                      {q.correctAnswer}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-sm ${
                  isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                }`}>
                  <div className="flex items-start gap-2 mb-2 font-bold">
                    {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <span className="font-bold mb-1 block">Explanation:</span>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                       <ReactMarkdown>
                          {q.explanation || '*No explanation provided.*'}
                       </ReactMarkdown>
                          </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResultPage;
