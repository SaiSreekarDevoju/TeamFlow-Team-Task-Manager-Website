export const getStatusColors = (status) => {
  switch (status) {
    case 'TODO': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_REVIEW': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'DONE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'BLOCKED': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getPriorityColors = (priority) => {
  switch (priority) {
    case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getPriorityBorderColor = (priority) => {
  switch (priority) {
    case 'LOW': return 'border-l-slate-400';
    case 'MEDIUM': return 'border-l-blue-500';
    case 'HIGH': return 'border-l-orange-500';
    case 'CRITICAL': return 'border-l-red-500';
    default: return 'border-l-slate-200';
  }
};
