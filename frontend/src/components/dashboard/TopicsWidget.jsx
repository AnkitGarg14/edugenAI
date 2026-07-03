import React from 'react';

const TopicsWidget = ({ title, topics }) => {
  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-text-primary mb-6">{title}</h3>
      
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {topics.map((topic, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-text-primary">{topic.name}</span>
              <span className="text-text-secondary font-medium">{topic.score}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  topic.score > 70 ? 'bg-success' : topic.score > 40 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${topic.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicsWidget;
