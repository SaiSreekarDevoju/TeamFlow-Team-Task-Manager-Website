import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const OverdueList = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No upcoming deadlines in the next 7 days!
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="divide-y divide-slate-200">
        {tasks.map((task) => {
          const isOverdue = new Date(task.dueDate) < new Date();
          return (
            <li key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
              <Link to={`/projects/${task.projectId}/tasks/${task.id}`} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AlertCircle className={`h-5 w-5 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Project: {task.project?.title}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isOverdue ? 'Overdue' : 'Due ' + formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OverdueList;
