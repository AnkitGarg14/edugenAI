import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-secondary';
  
  // Map color prop to specific tailwind arbitrary colors or safe classes
  // Since we use dynamic colors, we'll map them explicitly to avoid purge issues
  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    orange: { bg: 'bg-warning/10', text: 'text-warning' },
    green: { bg: 'bg-success/10', text: 'text-success' },
    purple: { bg: 'bg-accent/10', text: 'text-accent' },
  };
  
  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div className="glass-panel p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-text-secondary font-medium text-sm mb-2">{title}</h3>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-text-primary">{value}</span>
            {subtitle && <span className="text-sm text-text-secondary mb-1 font-medium">{subtitle}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {trendValue && (
        <div className="flex items-center gap-1 mt-auto relative z-10">
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
          </span>
          <span className="text-xs text-text-secondary font-medium">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
