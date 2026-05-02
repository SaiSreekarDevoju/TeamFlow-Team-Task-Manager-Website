import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export const useSearch = (query, type = 'all') => {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => api.get('/search', { params: { q: query, type } }),
    enabled: query.length > 2,
    staleTime: 60000,
  });
};
