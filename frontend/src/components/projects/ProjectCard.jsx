import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { isOverdue } from '../../utils/dateUtils';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const ProjectCard = ({ project }) => {
  const isProjectOverdue = isOverdue(project.dueDate, project.status);
  
  const totalTasks = project._count?.tasks || 0;
  // taskSummary might come from detail or we use 0
  const doneTasks = project.taskSummary?.DONE || 0;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const statusColors = {
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    ON_HOLD: 'bg-amber-100 text-amber-800',
    ARCHIVED: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <Badge colorClass={statusColors[project.status]}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Avatar user={project.owner} size="sm" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate" title={project.title}>
          {project.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">
          {project.description || 'No description provided.'}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} colorClass="bg-blue-500" />
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{project._count?.members || 1} members</span>
            </div>
            {project.dueDate && (
              <div className={`flex items-center ${isProjectOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>Due {formatDistanceToNow(new Date(project.dueDate), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
        <Link 
          to={`/projects/${project.id}`}
          className="block text-center w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Open Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
