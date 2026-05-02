import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useUsers = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.get('/users', { params }),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update role')
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Status updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update status')
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete user')
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update profile')
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => api.put(`/users/me/password`, data),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update password')
  });
};
