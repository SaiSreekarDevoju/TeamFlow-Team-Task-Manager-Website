import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={AlertTriangle}
          title="Page not found"
          description="Sorry, we couldn't find the page you're looking for."
          action={
            <Link to="/dashboard">
              <Button>Go back to Dashboard</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
};

export default NotFound;
