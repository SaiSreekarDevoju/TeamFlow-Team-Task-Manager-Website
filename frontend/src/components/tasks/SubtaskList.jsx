import React, { useState } from 'react';
import { useCreateSubtask, useUpdateTaskStatus, useDeleteTask } from '../../hooks/useTasks';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const SubtaskList = ({ projectId, taskId, subtasks, canEdit }) => {
  const { mutate: createSubtask, isPending } = useCreateSubtask();
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask } = useDeleteTask();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const doneCount = subtasks.filter(s => s.status === 'DONE').length;
  const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createSubtask(
        { projectId, taskId, data: { title: newTitle } },
        { onSuccess: () => { setNewTitle(''); setIsAdding(false); } }
      );
    }
  };

  const handleToggleStatus = (subtaskId, currentStatus) => {
    if (!canEdit) return;
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    updateStatus({ projectId, taskId: subtaskId, status: newStatus });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900">Subtasks</h3>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
          {doneCount}/{subtasks.length}
        </span>
      </div>
      
      {subtasks.length > 0 && (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <ul className="space-y-2 mb-3">
        {subtasks.map(subtask => (
          <li key={subtask.id} className="flex items-center justify-between group bg-slate-50 hover:bg-slate-100 p-2 rounded-md transition-colors border border-transparent hover:border-slate-200">
            <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleStatus(subtask.id, subtask.status)}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${subtask.status === 'DONE' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {subtask.status === 'DONE' && <CheckIcon />}
              </div>
              <span className={`text-sm truncate ${subtask.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {subtask.title}
              </span>
            </div>
            {canEdit && (
              <button
                onClick={() => deleteTask({ projectId, taskId: subtask.id })}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        isAdding ? (
          <form onSubmit={handleAdd} className="flex space-x-2 mt-2">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <Button type="submit" size="sm" isLoading={isPending}>Add</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center text-sm text-slate-500 hover:text-blue-600 font-medium py-1"
          >
            <Plus className="w-4 h-4 mr-1" /> Add subtask
          </button>
        )
      )}
    </div>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white">
    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
  </svg>
);

export default SubtaskList;
