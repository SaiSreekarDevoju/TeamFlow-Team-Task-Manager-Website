import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Layout & Guards
import Layout from './components/layout/Layout';
import PrivateRoute from './guards/PrivateRoute';
import RoleGuard from './guards/RoleGuard';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import NewProject from './pages/projects/NewProject';
import TaskDetail from './pages/tasks/TaskDetail';
import NewTask from './pages/tasks/NewTask';
import MyTasks from './pages/tasks/MyTasks';
import UserManagement from './pages/users/UserManagement';
import UserProfile from './pages/users/UserProfile';
import Notifications from './pages/notifications/Notifications';
import SearchResults from './pages/search/SearchResults';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Private Routes */}
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/new" element={
                  <RoleGuard allowedRoles={['ADMIN']} fallback={<Navigate to="/projects" />}>
                    <NewProject />
                  </RoleGuard>
                } />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                
                <Route path="/projects/:id/tasks/new" element={<NewTask />} />
                <Route path="/projects/:id/tasks/:tid" element={<TaskDetail />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                
                <Route path="/users" element={
                  <RoleGuard allowedRoles={['ADMIN']} fallback={<Navigate to="/dashboard" />}>
                    <UserManagement />
                  </RoleGuard>
                } />
                <Route path="/users/profile" element={<UserProfile />} />
                
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/search" element={<SearchResults />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
