import React from 'react';
import { MessageSquare, AlertCircle, Info, CheckSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'MENTION': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'OVERDUE': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'ASSIGNMENT': return <CheckSquare className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <li
      onClick={onClick}
      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex gap-3 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm text-slate-900 ${!notification.isRead ? 'font-medium' : ''}`}>
          {notification.message}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 flex items-center">
          <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
        </div>
      )}
    </li>
  );
};

export default NotificationItem;
