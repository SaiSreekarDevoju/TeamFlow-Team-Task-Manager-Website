import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const StatusChart = ({ data }) => {
  const chartData = [
    { name: 'To Do', value: data?.TODO || 0, color: '#94a3b8' },
    { name: 'In Progress', value: data?.IN_PROGRESS || 0, color: '#3b82f6' },
    { name: 'In Review', value: data?.IN_REVIEW || 0, color: '#f59e0b' },
    { name: 'Done', value: data?.DONE || 0, color: '#10b981' },
    { name: 'Blocked', value: data?.BLOCKED || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
