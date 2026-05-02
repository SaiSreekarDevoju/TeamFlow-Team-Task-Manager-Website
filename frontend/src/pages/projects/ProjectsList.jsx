import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import ProjectCard from '../../components/projects/ProjectCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const ProjectsListContent = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Debounce search in a real app, but for now just pass it
  const { data, isLoading, error } = useProjects({ page, limit: 9, search, status });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset to page 1 on new search
  };

  if (error) return <div className="p-8 text-center text-red-500">Failed to load projects</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Manage and track all your team's projects</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </form>
        <div className="sm:w-48">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : data?.data?.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={search || status ? "No projects match your filters." : "You don't have any projects yet."}
          action={
            user?.role === 'ADMIN' ? (
              <Link to="/projects/new">
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Create your first project</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-8 rounded-lg overflow-hidden border border-slate-200">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ProjectsList = () => (
  <ErrorBoundary>
    <ProjectsListContent />
  </ErrorBoundary>
);

export default ProjectsList;
