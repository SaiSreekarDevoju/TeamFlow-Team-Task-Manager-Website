import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useProjects = (params) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.get('/projects', { params }),
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create project');
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update project')
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete project')
  });
};

// Members
export const useProjectMembers = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => api.get(`/projects/${projectId}/members`),
    enabled: !!projectId,
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => api.post(`/projects/${projectId}/members`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'members'] });
      toast.success('Member added successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to add member')
  });
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }) => api.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'members'] });
      toast.success('Member removed successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to remove member')
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, role }) => api.patch(`/projects/${projectId}/members/${userId}`, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'members'] });
      toast.success('Role updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update role')
  });
};
