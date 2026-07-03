import React from 'react';
import { ArrowRight } from 'lucide-react';

const ListWidget = ({ title, items, onViewAll }) => {
  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            View All <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 border border-transparent hover:border-border p-3 rounded-xl transition-all -mx-2">
              <div className={`p-2.5 rounded-lg ${item.colorClass || 'bg-slate-100 text-slate-600'}`}>
                {Icon && <Icon size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-primary truncate">{item.title}</h4>
                <p className="text-xs text-text-secondary truncate mt-0.5">{item.subtitle}</p>
              </div>
              {item.rightContent && (
                <div className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-md">
                  {item.rightContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListWidget;
