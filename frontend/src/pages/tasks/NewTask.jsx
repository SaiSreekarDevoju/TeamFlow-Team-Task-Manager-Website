import React from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateTask } from '../../hooks/useTasks';
import TaskForm from '../../components/tasks/TaskForm';

const NewTask = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'TODO';

  const { mutate: createTask, isPending } = useCreateTask();

  const handleSubmit = (data) => {
    createTask(
      { projectId, data },
      {
        onSuccess: () => navigate(`/projects/${projectId}`)
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-slate-500 mb-6">
        <Link to={`/projects/${projectId}`} className="hover:text-blue-600 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Task</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <TaskForm 
          projectId={projectId}
          onSubmit={handleSubmit} 
          isLoading={isPending} 
          defaultValues={{ status: initialStatus, priority: 'MEDIUM' }}
        />
      </div>
    </div>
  );
};

export default NewTask;
