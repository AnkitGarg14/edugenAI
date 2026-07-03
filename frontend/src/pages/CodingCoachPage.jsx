import React, { useState } from 'react';
import { codingCoachApi } from '../services/codingCoachApi';
import { Code2, AlertCircle, Zap, Bug, Clock, CheckCircle2, ChevronRight, HardDrive, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CodingCoachPage = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await codingCoachApi.analyzeCode(code, language);
      setResult(data);
    } catch (error) {
      console.error('Failed to analyze code:', error);
      // In a real app, you'd show a toast here
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
            <Code2 className="text-primary" size={32} />
            AI Coding Coach
          </h1>
          <p className="text-slate-500 mt-2">Paste your code below to get instant feedback on bugs, complexity, and optimizations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="flex flex-col h-full">
          <div className="glass-panel p-4 flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !code.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {analyzing ? (
                  <><Loader2 className="animate-spin" size={18} /> Analyzing...</>
                ) : (
                  <><Sparkles size={18} /> Analyze Code</>
                )}
              </button>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="flex-1 w-full bg-[#1e1e1e] text-slate-200 p-4 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="h-full">
          {!result && !analyzing && (
            <div className="glass-panel h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center min-h-[500px]">
              <Code2 size={64} className="mb-4 opacity-20" />
              <h3 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">Awaiting Code</h3>
              <p>Paste your code and click Analyze to receive structured feedback.</p>
            </div>
          )}

          {analyzing && (
            <div className="glass-panel h-full flex flex-col items-center justify-center text-primary p-12 min-h-[500px]">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-medium animate-pulse">Running Static Analysis...</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="glass-panel p-6 border-l-4 border-l-primary">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Summary</h3>
                <p className="text-slate-600 dark:text-slate-300">{result.summary}</p>
              </div>

              {/* Complexity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Time Complexity</div>
                    <div className="font-mono font-semibold text-light-text dark:text-dark-text text-lg">
                      {result.timeComplexity?.split('-')[0]?.trim() || result.timeComplexity}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2" title={result.timeComplexity}>
                      {result.timeComplexity?.split('-')[1]?.trim()}
                    </div>
                  </div>
                </div>
                
                <div className="glass-panel p-4 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Space Complexity</div>
                    <div className="font-mono font-semibold text-light-text dark:text-dark-text text-lg">
                      {result.spaceComplexity?.split('-')[0]?.trim() || result.spaceComplexity}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2" title={result.spaceComplexity}>
                      {result.spaceComplexity?.split('-')[1]?.trim()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bugs Section */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <Bug className="text-rose-500" /> Potential Bugs
                </h3>
                {result.bugs && result.bugs.length > 0 ? (
                  <div className="space-y-4">
                    {result.bugs.map((bug, i) => (
                      <div key={i} className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50 p-4 rounded-xl">
                        <div className="font-semibold text-rose-700 dark:text-rose-400 mb-2">{bug.issue}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{bug.fix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">No obvious bugs detected. Great job!</span>
                  </div>
                )}
              </div>

              {/* Optimizations */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <Zap className="text-amber-500" /> Optimizations & Best Practices
                </h3>
                <div className="space-y-4">
                  {[...(result.optimizations || []), ...(result.bestPractices || [])].map((opt, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <ChevronRight size={18} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{opt}</span>
                    </div>
                  ))}
                  {(!result.optimizations?.length && !result.bestPractices?.length) && (
                    <p className="text-slate-500 italic text-sm">No major optimizations suggested.</p>
                  )}
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Detailed Explanation</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <ReactMarkdown>{result.explanation || "No explanation provided."}</ReactMarkdown>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingCoachPage;
