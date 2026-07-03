import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../services/quizApi';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStudySession } from '../../hooks/useStudySession';

const QuizTakePage = () => {
  useStudySession('Quiz');
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const handleAnswerChange = (questionIndex, value) => {
    if (isSubmitting) return;
    setAnswers({
      ...answers,
      [questionIndex]: value
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    let score = 0;
    const totalQuestions = quiz.questions.length;
    
    // Evaluate answers
    quiz.questions.forEach((q, index) => {
      const userAnswer = answers[index]?.trim().toLowerCase() || '';
      const correctAnswer = String(q.correctAnswer).trim().toLowerCase();
      
      if (userAnswer === correctAnswer) {
        score += 1;
      }
    });

    try {
      await quizApi.submitAttempt(id, { score, totalQuestions, answers });
      navigate(`/quizzes/${id}/result`);
    } catch (error) {
      console.error('Failed to submit attempt:', error);
      setSubmitError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!quiz) return <div className="p-8 text-center text-rose-500">Quiz not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24">
      <button 
        onClick={() => navigate('/quizzes')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Quizzes
      </button>

      <div className="glass-panel p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BrainCircuit size={120} />
        </div>
        <div className="flex gap-2 mb-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
            {quiz.quizType === 'mixed' ? 'Mixed' : quiz.quizType}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            {quiz.difficulty}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-2">
          {quiz.topic}
        </h1>
        <p className="text-slate-500">
          {quiz.questions?.length || 0} Questions • AI Generated
        </p>
      </div>



      {quiz.questions && quiz.questions.length > 0 ? (
        <div className="space-y-8">
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index] || '';
            return (
              <div key={index} className="glass-panel p-6 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                  <div className="pt-1 flex-1">
                    <div className="font-medium text-light-text dark:text-dark-text text-lg">
                      <ReactMarkdown>{q.questionText || ''}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="pl-12 space-y-3">
                  {/* Options rendering based on type */}
                  {(q.type === 'mcq' || q.type === 'true_false' || (q.options && q.options.length > 0)) ? (
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <label key={optIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          userAnswer === opt 
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary' 
                            : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'
                        } ${isSubmitting ? 'pointer-events-none' : ''}`}>
                          <input 
                            type="radio" 
                            name={`question-${index}`} 
                            value={opt}
                            checked={userAnswer === opt}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className="ml-3 text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input 
                        type="text" 
                        value={userAnswer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Type your answer here..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none transition-shadow disabled:opacity-75"
                      />
                    </div>
                  )}


                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center text-slate-500 flex flex-col items-center">
          <AlertCircle size={32} className="mb-2 text-amber-500" />
          <p>This quiz doesn't have any structured questions.</p>
          <p className="text-sm mt-2">Try generating a new quiz using the updated AI Tutor.</p>
        </div>
      )}

      {quiz.questions && quiz.questions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-40 flex flex-col items-center justify-center gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {submitError && (
            <div className="text-rose-500 text-sm font-medium">
              {submitError}
            </div>
          )}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-md bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTakePage;
