import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useTasks = (projectId, params) => {
  return useQuery({
    queryKey: ['tasks', projectId, params],
    queryFn: () => api.get(`/projects/${projectId}/tasks`, { params }),
    enabled: !!projectId,
  });
};

export const useMyTasks = (params) => {
  // Can just query the search endpoint or use dashboard stats
  // We'll create a dedicated query here or pass down.
  // Actually, we need to query /projects/:pid/tasks for ALL projects
  // but it's simpler to rely on search for now or a custom endpoint.
  // We'll map to /dashboard since it returns My Tasks, but full pagination requires tasks API.
  // We'll assume the search endpoint `type=tasks` can handle this, or a specific endpoint.
  // For the assignment we will hit a unified endpoint or map over accessible projects.
  // Wait, backend doesn't have a specific GET /tasks for all projects, 
  // Let's use search API `?type=tasks&q=` but with empty q it handles it now!
  return useQuery({
    queryKey: ['my-tasks', params],
    queryFn: () => api.get('/search?type=tasks', { params }),
  });
};

export const useTask = (projectId, taskId) => {
  return useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => api.get(`/projects/${projectId}/tasks/${taskId}`),
    enabled: !!projectId && !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => api.post(`/projects/${projectId}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      toast.success('Task created successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create task')
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, data }) => api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.projectId, variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      toast.success('Task updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update task')
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, status }) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.projectId, variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Optimistic update should be handled in the component
    },
    onError: (err) => toast.error(err?.message || 'Failed to update status')
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId }) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      toast.success('Task deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete task')
  });
};

export const useLogTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, hours }) => api.patch(`/projects/${projectId}/tasks/${taskId}/log-time`, { hours }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.projectId, variables.taskId] });
      toast.success('Time logged');
    },
    onError: (err) => toast.error(err?.message || 'Failed to log time')
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, updates }) => api.post(`/projects/${projectId}/tasks/reorder`, { updates }),
    // Optimistic UI happens before this
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
    },
    onError: (err, variables, context) => {
      toast.error('Failed to save order. Refreshing...');
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
    }
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, content }) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.projectId, variables.taskId] });
    },
    onError: (err) => toast.error(err?.message || 'Failed to add comment')
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, commentId }) => api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.projectId, variables.taskId] });
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete comment')
  });
};

export const useCreateSubtask = () => ({ mutate: () => { } });