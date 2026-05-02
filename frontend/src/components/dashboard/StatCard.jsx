import React from 'react';

const StatCard = ({ title, value, icon: Icon, valueColor = 'text-slate-900', bgColor = 'bg-white' }) => {
  return (
    <div className={`overflow-hidden rounded-lg shadow-sm border border-slate-200 ${bgColor} p-5`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
            <dd>
              <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
