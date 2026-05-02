import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/formatters';

const Avatar = ({ user, size = 'md', className = '' }) => {
  if (!user) return null;

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const sizeClass = sizes[size] || sizes.md;

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 ${className}`}
        title={user.name}
      />
    );
  }

  const bgColor = getAvatarColor(user.id);
  const initials = getInitials(user.name);

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-medium ${bgColor} ${className}`}
      title={user.name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
