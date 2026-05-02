import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProfile, useChangePassword } from '../../hooks/useUsers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const UserProfileContent = () => {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfile({ id: user.id, data: { name, avatarUrl } });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    changePassword(
      { currentPassword, newPassword },
      { onSuccess: () => { setCurrentPassword(''); setNewPassword(''); } }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal information and security</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Personal Information</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center space-x-6 mb-6">
              <Avatar user={{ ...user, name, avatarUrl }} size="xl" />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Profile Picture</p>
                <p className="text-xs text-slate-500">Provide an image URL to update your avatar.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                value={user?.email || ''}
                disabled
              />
              <div className="sm:col-span-2">
                <Input
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isUpdatingProfile}>Save Changes</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Change Password</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            
            <div className="flex justify-end">
              <Button type="submit" isLoading={isChangingPassword}>Update Password</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => (
  <ErrorBoundary>
    <UserProfileContent />
  </ErrorBoundary>
);

export default UserProfile;
