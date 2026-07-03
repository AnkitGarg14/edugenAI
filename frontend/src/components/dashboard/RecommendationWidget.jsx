import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const RecommendationWidget = ({ recommendations }) => {
  return (
    <div className="glass-panel p-6 flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-white to-primary/5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Sparkles size={20} />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">AI Recommendations</h3>
      </div>
      
      <div className="flex flex-col gap-4 flex-1 relative z-10">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white border border-border shadow-sm p-4 rounded-xl hover:shadow-md transition-shadow">
            <h4 className="text-sm font-semibold text-text-primary mb-1">{rec.title}</h4>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">{rec.description}</p>
            <button className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              {rec.actionText} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationWidget;
