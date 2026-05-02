import React from 'react';

const ProgressBar = ({ progress, colorClass = 'bg-blue-600', heightClass = 'h-2', showLabel = false }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full flex items-center gap-3">
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClass}`}>
        <div 
          className={`${heightClass} ${colorClass} transition-all duration-500 ease-in-out`} 
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 w-8">{Math.round(safeProgress)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
