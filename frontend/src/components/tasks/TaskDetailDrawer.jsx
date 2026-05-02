import React, { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, User, Tag, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateTask, useUpdateTaskStatus, useLogTime } from '../../hooks/useTasks';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import StatusSelector from './StatusSelector';
import PriorityBadge from './PriorityBadge';
import SubtaskList from './SubtaskList';
import CommentSection from './CommentSection';
import AttachmentList from './AttachmentList';
import LabelPicker from './LabelPicker';
import { formatDate } from '../../utils/dateUtils';
import { formatDistanceToNow } from 'date-fns';

const TaskDetailDrawer = ({ task, projectId, onClose, projectMembers = [] }) => {
  const { user } = useAuth();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: logTime } = useLogTime();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState(task.description || '');

  const [activeTab, setActiveTab] = useState('details'); // details, activity

  // Permissions
  const isAssignee = task.assigneeId === user.id;
  const isAdmin = user.role === 'ADMIN';
  const canEdit = isAdmin || isAssignee;

  const handleTitleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTask({ projectId, taskId: task.id, data: { title } });
    }
    setIsEditingTitle(false);
  };

  const handleDescSave = () => {
    if (description !== task.description) {
      updateTask({ projectId, taskId: task.id, data: { description } });
    }
    setIsEditingDesc(false);
  };

  const handleStatusChange = (status) => {
    updateStatus({ projectId, taskId: task.id, status });
  };

  const handleAssigneeChange = (e) => {
    const newAssigneeId = e.target.value === '' ? null : e.target.value;
    updateTask({ projectId, taskId: task.id, data: { assigneeId: newAssigneeId } });
  };

  const handleLogTime = () => {
    const hours = prompt('Enter hours to log (e.g., 1.5):');
    if (hours && !isNaN(hours) && Number(hours) > 0) {
      logTime({ projectId, taskId: task.id, hours: Number(hours) });
    }
  };

  const handleLabelsChange = (labelIds) => {
    updateTask({ projectId, taskId: task.id, data: { labelIds } });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full transform transition-transform overflow-hidden lg:rounded-l-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500">Task {task.id.substring(0,8)}</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            
            {/* Left Panel (Main Content) */}
            <div className="flex-1 p-6 lg:border-r border-slate-200 min-h-0 lg:overflow-y-auto">
              
              {/* Title */}
              <div className="mb-6">
                {isEditingTitle && canEdit ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="w-full text-2xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 bg-transparent"
                    autoFocus
                  />
                ) : (
                  <h2 
                    className={`text-2xl font-bold text-slate-900 ${canEdit ? 'cursor-pointer hover:bg-slate-50' : ''} p-1 -ml-1 rounded`}
                    onClick={() => canEdit && setIsEditingTitle(true)}
                  >
                    {task.title}
                  </h2>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                {isEditingDesc && canEdit ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[120px] rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleDescSave}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => { setDescription(task.description || ''); setIsEditingDesc(false); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`prose prose-sm max-w-none text-slate-600 min-h-[60px] p-3 rounded-md ${canEdit ? 'cursor-pointer hover:bg-slate-50' : ''} ${!task.description ? 'bg-slate-50 italic text-slate-400' : 'bg-slate-50/50'}`}
                    onClick={() => canEdit && setIsEditingDesc(true)}
                  >
                    {task.description ? task.description.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>) : 'Add a more detailed description...'}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className="mb-8">
                <SubtaskList projectId={projectId} taskId={task.id} subtasks={task.subtasks || []} canEdit={canEdit} />
              </div>

              {/* Attachments */}
              <div className="mb-8">
                <AttachmentList projectId={projectId} taskId={task.id} attachments={task.attachments || []} canEdit={canEdit} />
              </div>

              {/* Tabs: Comments vs Activity */}
              <div className="mt-8">
                <div className="border-b border-slate-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      Comments ({task.comments?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      Activity
                    </button>
                  </nav>
                </div>

                <div className="pt-6">
                  {activeTab === 'details' ? (
                    <CommentSection projectId={projectId} taskId={task.id} comments={task.comments || []} projectMembers={projectMembers} />
                  ) : (
                    <div className="space-y-4">
                      {task.activities?.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
                      {task.activities?.map(activity => (
                        <div key={activity.id} className="flex space-x-3">
                          <Avatar user={activity.actor} size="sm" />
                          <div>
                            <p className="text-sm text-slate-600">
                              <span className="font-medium text-slate-900">{activity.actor.name}</span> {activity.action}
                            </p>
                            <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Panel (Metadata) */}
            <div className="w-full lg:w-80 p-6 bg-slate-50 min-h-0 lg:overflow-y-auto border-t lg:border-t-0 border-slate-200 space-y-6">
              
              {/* Status */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</h4>
                <StatusSelector status={task.status} onChange={handleStatusChange} disabled={!canEdit} />
              </div>

              {/* Assignee */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><User className="w-3.5 h-3.5 mr-1" /> Assignee</h4>
                {isAdmin ? (
                  <select
                    value={task.assigneeId || ''}
                    onChange={handleAssigneeChange}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {task.assignee ? (
                      <>
                        <Avatar user={task.assignee} size="sm" />
                        <span className="text-sm text-slate-700">{task.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</h4>
                {isAdmin || isAssignee ? (
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask({ projectId, taskId: task.id, data: { priority: e.target.value } })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                ) : (
                  <PriorityBadge priority={task.priority} />
                )}
              </div>

              {/* Labels */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> Labels</h4>
                <LabelPicker 
                  projectId={projectId} 
                  selectedLabelIds={task.labels?.map(l => l.labelId) || []} 
                  onChange={handleLabelsChange}
                  disabled={!canEdit}
                />
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><CalendarIcon className="w-3.5 h-3.5 mr-1" /> Due Date</h4>
                {isAdmin || isAssignee ? (
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => updateTask({ projectId, taskId: task.id, data: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null } })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                ) : (
                  <span className="text-sm text-slate-700">{task.dueDate ? formatDate(task.dueDate) : 'None'}</span>
                )}
              </div>

              {/* Time Tracking */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Time Tracking</h4>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Logged: {task.loggedHours}h</span>
                    <span>Est: {task.estimatedHours || 0}h</span>
                  </div>
                  <ProgressBar 
                    progress={task.estimatedHours ? (task.loggedHours / task.estimatedHours) * 100 : 0} 
                    colorClass={(task.estimatedHours && task.loggedHours > task.estimatedHours) ? 'bg-red-500' : 'bg-blue-500'} 
                  />
                  {canEdit && (
                    <button 
                      onClick={handleLogTime}
                      className="mt-3 w-full text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 py-1.5 rounded transition-colors"
                    >
                      Log Time
                    </button>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 space-y-1">
                <p>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                <p>Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</p>
                <p>Reporter: {task.reporter?.name}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
