import React, { useState } from 'react';
import { useMyTasks } from '../../hooks/useTasks';
import MyTasksTable from '../../components/dashboard/MyTasksTable';
import Spinner from '../../components/ui/Spinner';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const MyTasksContent = () => {
  const [statusFilter, setStatusFilter] = useState('');
  
  // We use the search endpoint hook but pass a status filter if needed.
  // The search endpoint in our backend doesn't explicitly filter by status via query param out of the box unless we modified it.
  // Actually, wait, our GET /search has no status filter natively, but we can filter it client-side.
  const { data, isLoading, error } = useMyTasks();

  if (isLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load tasks</div>;

  let tasks = data?.data?.tasks || [];
  
  if (statusFilter) {
    tasks = tasks.filter(t => t.status === statusFilter);
  }

  // Sort by due date
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500">All tasks assigned to you across all projects</p>
        </div>
        
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <MyTasksTable tasks={tasks} />
      </div>
    </div>
  );
};

const MyTasks = () => (
  <ErrorBoundary>
    <MyTasksContent />
  </ErrorBoundary>
);

export default MyTasks;
