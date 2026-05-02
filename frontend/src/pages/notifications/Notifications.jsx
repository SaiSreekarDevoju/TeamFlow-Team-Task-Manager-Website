import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { Check, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import NotificationItem from '../../components/notifications/NotificationItem';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const NotificationsContent = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  if (isLoading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;

  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated on your tasks and projects</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllRead()} 
            isLoading={isMarkingAll}
          >
            <Check className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
            <p className="text-sm text-slate-500 mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onClick={() => handleNotificationClick(notification)} 
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const Notifications = () => (
  <ErrorBoundary>
    <NotificationsContent />
  </ErrorBoundary>
);

export default Notifications;
