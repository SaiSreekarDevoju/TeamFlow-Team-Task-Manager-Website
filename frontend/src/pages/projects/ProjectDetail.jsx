import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { 
  Plus, Settings, Users, ArrowLeft, BarChart2, MoreVertical, Trash2, Edit
} from 'lucide-react';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import { useTasks, useReorderTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

import TaskCard from '../../components/tasks/TaskCard';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import MemberList from '../../components/projects/MemberList';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Modal from '../../components/ui/Modal';
import ProjectForm from '../../components/projects/ProjectForm';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-amber-50' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-50' },
  { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-50' },
];

const ProjectDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading: projectLoading, error: projectError } = useProject(id);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id);
  
  const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject();
  const { mutate: reorderTasks } = useReorderTasks();

  const [activeTab, setActiveTab] = useState('board'); // board, members, settings
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  const [localTasks, setLocalTasks] = useState([]);
  
  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  useEffect(() => {
    if (tasksData?.data) {
      setLocalTasks(tasksData.data);
    }
  }, [tasksData]);

  if (projectLoading || tasksLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;
  if (projectError) return <div className="p-8 text-center text-red-500">Failed to load project details or you don't have access.</div>;

  const project = projectData?.data;
  if (!project) return null;

  const isAdmin = user.role === 'ADMIN' || project.members?.some(m => m.userId === user.id && m.role === 'ADMIN');

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI Update
    const newTasks = Array.from(localTasks);
    const draggedTask = newTasks.find(t => t.id === draggableId);
    
    // Remove from old list
    const sourceList = newTasks.filter(t => t.status === source.droppableId).sort((a,b) => a.order - b.order);
    sourceList.splice(source.index, 1);
    
    // Add to new list
    const destList = newTasks.filter(t => t.status === destination.droppableId && t.id !== draggableId).sort((a,b) => a.order - b.order);
    draggedTask.status = destination.droppableId;
    destList.splice(destination.index, 0, draggedTask);

    // Update order values for destination list
    const updates = destList.map((t, index) => {
      t.order = index;
      return { id: t.id, status: destination.droppableId, order: index };
    });

    // Also update order values for source list if it changed
    if (source.droppableId !== destination.droppableId) {
       sourceList.forEach((t, index) => {
         t.order = index;
         updates.push({ id: t.id, status: source.droppableId, order: index });
       });
    }

    // Merge back
    const otherTasks = newTasks.filter(t => t.status !== source.droppableId && t.status !== destination.droppableId);
    setLocalTasks([...otherTasks, ...sourceList, ...destList]);

    // Send API request
    reorderTasks({ projectId: id, updates });
  };

  const handleDeleteProject = () => {
    deleteProject(id, {
      onSuccess: () => navigate('/projects')
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center mb-4 text-sm text-slate-500">
          <Link to="/projects" className="hover:text-blue-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="truncate">{project.title}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900 mr-3">{project.title}</h1>
              <Badge colorClass={project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl truncate">{project.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to={`/projects/${id}/tasks/new`}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </Link>
            
            {isAdmin && (
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
                {isSettingsMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSettingsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5 py-1">
                      <button onClick={() => { setIsSettingsMenuOpen(false); setActiveTab('settings'); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <Edit className="w-4 h-4 mr-2" /> Edit Project
                      </button>
                      <button onClick={() => { setIsSettingsMenuOpen(false); setIsDeleteModalOpen(true); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('board')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'board' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <BarChart2 className="w-4 h-4 mr-2" /> Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <Users className="w-4 h-4 mr-2" /> Members ({project.members?.length || 0})
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        
        {activeTab === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 h-full pb-4">
              {COLUMNS.map(column => {
                const columnTasks = localTasks
                  .filter(t => t.status === column.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div key={column.id} className="flex flex-col w-80 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 ${column.id === 'DONE' ? 'bg-emerald-500' : column.id === 'BLOCKED' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        {column.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 min-h-[150px] rounded-lg p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : column.color} border border-slate-200 shadow-inner overflow-y-auto`}
                        >
                          {columnTasks.map((task, index) => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              index={index} 
                              onClick={() => setSelectedTaskId(task.id)}
                            />
                          ))}
                          {provided.placeholder}
                          
                          <Link to={`/projects/${id}/tasks/new?status=${column.id}`} className="block w-full">
                            <button className="w-full py-2 mt-2 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 rounded transition-colors">
                              <Plus className="w-4 h-4 mr-1" /> Add Task
                            </button>
                          </Link>
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {activeTab === 'members' && (
          <div className="max-w-4xl mx-auto">
            <MemberList projectId={id} projectOwnerId={project.ownerId} />
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-6">Project Settings</h2>
            <ProjectForm 
              defaultValues={project} 
              isEdit={true} 
              onSubmit={async (data) => {
                 try {
                   await api.patch(`/projects/${id}`, data);
                   queryClient.invalidateQueries({ queryKey: ['project', id] });
                   setActiveTab('board');
                 } catch (err) {}
              }} 
            />
            
            <div className="mt-12 pt-6 border-t border-slate-200">
              <h3 className="text-md font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-500 mb-4">Once you delete a project, there is no going back. Please be certain.</p>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                Delete Project
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Task Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          projectId={id}
          task={localTasks.find(t => t.id === selectedTaskId)}
          projectMembers={project.members}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you absolutely sure you want to delete "${project.title}"? This action cannot be undone and will permanently delete all tasks, comments, and files associated with this project.`}
        confirmText="Yes, delete project"
        isLoading={isDeletingProject}
      />
    </div>
  );
};

const ProjectDetail = () => (
  <ErrorBoundary>
    <ProjectDetailContent />
  </ErrorBoundary>
);

export default ProjectDetail;
