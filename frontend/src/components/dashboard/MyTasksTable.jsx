import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { getStatusColors, getPriorityColors } from '../../utils/statusColors';
import { formatDate } from '../../utils/dateUtils';

const MyTasksTable = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No tasks assigned to you right now. Enjoy your day!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Task
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {tasks.slice(0, 10).map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
            
            return (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/projects/${task.projectId}/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900">
                    {task.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <Link to={`/projects/${task.projectId}`} className="hover:text-blue-600">
                    {task.project?.title || 'Unknown Project'}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <Badge colorClass={getStatusColors(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <Badge colorClass={getPriorityColors(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  {task.dueDate ? formatDate(task.dueDate) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyTasksTable;
