import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../../hooks/useTasks';
import { useProjectMembers } from '../../hooks/useProjects';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import Spinner from '../../components/ui/Spinner';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const TaskDetailContent = () => {
  const { id: projectId, tid: taskId } = useParams();
  const navigate = useNavigate();

  const { data: taskData, isLoading: taskLoading } = useTask(projectId, taskId);
  const { data: membersData, isLoading: membersLoading } = useProjectMembers(projectId);

  if (taskLoading || membersLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;
  
  if (!taskData?.data) {
    return <div className="p-8 text-center text-red-500">Task not found</div>;
  }

  return (
    <TaskDetailDrawer
      taskId={taskId}
      projectId={projectId}
      task={taskData.data}
      projectMembers={membersData?.data || []}
      onClose={() => navigate(`/projects/${projectId}`)}
    />
  );
};

const TaskDetail = () => (
  <ErrorBoundary>
    <TaskDetailContent />
  </ErrorBoundary>
);

export default TaskDetail;
