import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 flex flex-col max-h-[80vh] z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onClick={() => handleNotificationClick(notification)} 
              />
            ))}
          </ul>
        )}
      </div>

      {notifications.length > 5 && (
        <div className="px-4 py-2 border-t border-slate-100 text-center">
          <button
            onClick={() => { onClose(); navigate('/notifications'); }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
