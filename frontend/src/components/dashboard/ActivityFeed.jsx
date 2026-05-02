import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="flow-root p-6">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <Avatar user={activity.actor} size="md" className="ring-8 ring-white" />
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-900 mr-1">{activity.actor?.name}</span>
                      {activity.action}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-slate-500">
                    <time dateTime={activity.createdAt}>
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
