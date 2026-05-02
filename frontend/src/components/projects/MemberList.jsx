import React, { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember, useUpdateMemberRole } from '../../hooks/useProjects';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

const MemberList = ({ projectId, projectOwnerId }) => {
  const { user } = useAuth();
  const { data: membersResponse, isLoading } = useProjectMembers(projectId);
  const { mutate: addMember, isPending: isAdding } = useAddProjectMember();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveProjectMember();
  const { mutate: updateRole } = useUpdateMemberRole();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');

  const members = membersResponse?.data || [];
  
  // Is the current user an ADMIN in this project (or a global ADMIN)?
  const currentUserMembership = members.find(m => m.userId === user?.id);
  const isProjectAdmin = user?.role === 'ADMIN' || currentUserMembership?.role === 'ADMIN';

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newEmail) return toast.error('Email is required');
    
    addMember(
      { projectId, data: { email: newEmail, role: newRole } },
      { onSuccess: () => { setIsAddModalOpen(false); setNewEmail(''); } }
    );
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    removeMember(
      { projectId, userId: memberToRemove.userId },
      { onSuccess: () => setMemberToRemove(null) }
    );
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading members...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-lg font-medium text-slate-900">Project Members ({members.length})</h3>
        {isProjectAdmin && (
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
              {isProjectAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar user={member.user} size="sm" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {member.user.name} 
                        {member.userId === projectOwnerId && <span className="ml-2 text-xs text-slate-500">(Owner)</span>}
                      </div>
                      <div className="text-sm text-slate-500">{member.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isProjectAdmin && member.userId !== projectOwnerId ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateRole({ projectId, userId: member.userId, role: e.target.value })}
                      className="text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  ) : (
                    <Badge colorClass={member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}>
                      {member.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1 inline" />}
                      {member.role}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                </td>
                {isProjectAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.userId !== projectOwnerId && member.userId !== user?.id && (
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="text-red-600 hover:text-red-900"
                        title="Remove member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Project Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="User Email"
            id="email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            placeholder="user@teamflow.com"
          />
          <div className="flex flex-col space-y-1">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">Project Role</label>
            <select
              id="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button type="submit" isLoading={isAdding}>Add Member</Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.user?.name} from this project?`}
        confirmText="Remove"
        isLoading={isRemoving}
      />
    </div>
  );
};

export default MemberList;
