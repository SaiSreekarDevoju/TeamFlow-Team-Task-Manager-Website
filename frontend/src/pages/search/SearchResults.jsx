import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { FolderKanban, CheckSquare, MessageSquare, Search as SearchIcon } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { getStatusColors } from '../../utils/statusColors';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const SearchResultsContent = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { data, isLoading } = useSearch(query);

  if (query.length <= 2) {
    return (
      <div className="p-12 text-center text-slate-500">
        <SearchIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <p>Please enter at least 3 characters to search.</p>
      </div>
    );
  }

  if (isLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;

  const results = data?.data || { projects: [], tasks: [], comments: [] };
  const totalResults = results.projects.length + results.tasks.length + results.comments.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <SearchIcon className="w-6 h-6 mr-2" /> Search Results for "{query}"
        </h1>
        <p className="text-sm text-slate-500 mt-1">Found {totalResults} matching items</p>
      </div>

      {totalResults === 0 && (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
          <p className="text-slate-600">No results found for your search query. Try adjusting your keywords.</p>
        </div>
      )}

      {results.projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 flex items-center border-b pb-2">
            <FolderKanban className="w-5 h-5 mr-2 text-blue-500" /> Projects ({results.projects.length})
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y">
            {results.projects.map(project => (
              <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                <Link to={`/projects/${project.id}`} className="block">
                  <h3 className="text-md font-medium text-blue-600">{project.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.tasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 flex items-center border-b pb-2">
            <CheckSquare className="w-5 h-5 mr-2 text-emerald-500" /> Tasks ({results.tasks.length})
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y">
            {results.tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                <Link to={`/projects/${task.projectId}/tasks/${task.id}`} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-medium text-blue-600">{task.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">In Project: {task.project?.title}</p>
                  </div>
                  <Badge colorClass={getStatusColors(task.status)}>{task.status.replace('_', ' ')}</Badge>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.comments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 flex items-center border-b pb-2">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-500" /> Comments ({results.comments.length})
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y">
            {results.comments.map(comment => (
              <div key={comment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <Link to={`/projects/${comment.task?.projectId}/tasks/${comment.taskId}`} className="block">
                  <p className="text-sm text-slate-800 line-clamp-2">"{comment.content}"</p>
                  <p className="text-xs text-slate-500 mt-2">
                    By {comment.author?.name} on task: {comment.task?.title}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchResults = () => (
  <ErrorBoundary>
    <SearchResultsContent />
  </ErrorBoundary>
);

export default SearchResults;
