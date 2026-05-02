import React from 'react';

const Badge = ({ children, colorClass = 'bg-slate-100 text-slate-800', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
