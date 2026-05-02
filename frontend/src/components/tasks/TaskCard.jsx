import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, CheckSquare, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { getPriorityBorderColor } from '../../utils/statusColors';

const TaskCard = ({ task, index, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  
  const subtasksCount = task._count?.subtasks || 0;
  const commentsCount = task._count?.comments || 0;
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className={`
            bg-white p-3 rounded-md shadow-sm border-l-4 border border-slate-200 cursor-pointer 
            hover:shadow-md transition-shadow mb-2 select-none
            ${getPriorityBorderColor(task.priority)}
            ${snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}
          `}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map(l => (
                <span 
                  key={l.labelId} 
                  className="w-8 h-1.5 rounded-full" 
                  style={{ backgroundColor: l.label.color }}
                  title={l.label.name}
                />
              ))}
            </div>
          )}

          <h4 className="text-sm font-medium text-slate-900 mb-2 line-clamp-2 leading-tight">
            {task.title}
          </h4>

          <div className="flex items-center justify-between text-slate-500 text-xs mt-3">
            {/* Meta */}
            <div className="flex items-center space-x-3">
              {commentsCount > 0 && (
                <div className="flex items-center" title={`${commentsCount} comments`}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  <span>{commentsCount}</span>
                </div>
              )}
              {subtasksCount > 0 && (
                <div className="flex items-center" title={`${subtasksCount} subtasks`}>
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  <span>{task.subtasks?.filter(s => s.status === 'DONE').length || 0}/{subtasksCount}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`} title="Due date">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                </div>
              )}
              {task.estimatedHours && (
                 <div className="flex items-center" title="Logged / Estimated">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>{task.loggedHours}/{task.estimatedHours}h</span>
                 </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee ? (
               <Avatar user={task.assignee} size="sm" />
            ) : (
               <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400" title="Unassigned">
                 <span className="text-[10px]">?</span>
               </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
