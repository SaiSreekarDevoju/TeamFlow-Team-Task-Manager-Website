import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateProject } from '../../hooks/useProjects';
import ProjectForm from '../../components/projects/ProjectForm';

const NewProject = () => {
  const navigate = useNavigate();
  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = (data) => {
    createProject(data, {
      onSuccess: (res) => {
        navigate(`/projects/${res.data.id}`);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-slate-500 mb-6">
        <Link to="/projects" className="hover:text-blue-600 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
        <p className="text-sm text-slate-500 mt-1">Setup a new workspace for your team.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <ProjectForm 
          onSubmit={handleSubmit} 
          isLoading={isPending} 
          defaultValues={{ status: 'ACTIVE' }}
        />
      </div>
    </div>
  );
};

export default NewProject;
