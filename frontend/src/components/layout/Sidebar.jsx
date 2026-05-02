import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Bell, Users, UserCircle, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Avatar from '../ui/Avatar';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  
  const unreadCount = notifications?.data?.filter(n => !n.isRead).length || 0;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    ...(user?.role === 'ADMIN' ? [{ name: 'Users', path: '/users', icon: Users }] : []),
    { name: 'Profile', path: '/users/profile', icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full bg-slate-900 text-slate-300 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">TeamFlow</h1>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
            <span className="flex-1">{item.name}</span>
            {item.badge > 0 && (
              <span className="bg-blue-600 text-white ml-auto inline-block py-0.5 px-2.5 text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center">
          <Avatar user={user} />
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
