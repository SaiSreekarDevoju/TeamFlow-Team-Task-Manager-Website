import React, { useState } from 'react';
import { useUsers, useUpdateUserRole, useToggleUserStatus, useDeleteUser } from '../../hooks/useUsers';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Trash2, Shield, UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const UserManagementContent = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, limit: 20 });
  const { mutate: updateRole } = useUpdateUserRole();
  const { mutate: toggleStatus } = useToggleUserStatus();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [userToDelete, setUserToDelete] = useState(null);

  if (isLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;

  const users = data?.data || [];

  const handleRoleChange = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    updateRole({ id: userId, role: newRole });
  };

  const handleStatusChange = (userId, isActive) => {
    toggleStatus({ id: userId, isActive: !isActive });
  };

  const handleDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => setUserToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">Manage system users, roles, and access</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar user={user} size="sm" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleRoleChange(user.id, user.role)}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <Badge colorClass={user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}>
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1 inline" />}
                        {user.role}
                      </Badge>
                      <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 ml-2 transition-opacity">Change</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleStatusChange(user.id, user.isActive)}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <Badge colorClass={user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 ml-2 transition-opacity">Toggle</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

const UserManagement = () => (
  <ErrorBoundary>
    <UserManagementContent />
  </ErrorBoundary>
);

export default UserManagement;
