import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import StatusChart from '../../components/dashboard/StatusChart';
import OverdueList from '../../components/dashboard/OverdueList';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import MyTasksTable from '../../components/dashboard/MyTasksTable';
import ProgressBar from '../../components/ui/ProgressBar';
import Spinner from '../../components/ui/Spinner';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

// Optional BarChart for Priorities or User tasks
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PriorityChart = ({ data }) => {
  const chartData = [
    { name: 'Low', value: data?.LOW || 0, color: '#94a3b8' },
    { name: 'Medium', value: data?.MEDIUM || 0, color: '#3b82f6' },
    { name: 'High', value: data?.HIGH || 0, color: '#f97316' },
    { name: 'Critical', value: data?.CRITICAL || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) return <div className="flex h-64 items-center justify-center text-slate-500 text-sm">No data</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: '#f8fafc'}} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardContent = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useDashboard();

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load dashboard data</div>;

  const data = dashboardData?.data;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {user?.name.split(' ')[0]}</h1>
        <p className="text-slate-500">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Assigned" 
          value={data.totalTasksAssignedToMe} 
          icon={CheckSquare} 
        />
        <StatCard 
          title="Due Today" 
          value={data.tasksDueToday} 
          icon={CalendarIcon} 
        />
        <StatCard 
          title="Overdue" 
          value={data.tasksOverdue} 
          icon={AlertTriangle} 
          valueColor="text-red-600" 
          bgColor={data.tasksOverdue > 0 ? "bg-red-50" : "bg-white"}
        />
        <StatCard 
          title="Done This Week" 
          value={data.tasksDoneThisWeek} 
          icon={CheckCircle2} 
          valueColor="text-emerald-600"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="text-lg font-medium text-slate-900 mb-4">My Tasks by Status</h3>
          <StatusChart data={data.tasksByStatus} />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="text-lg font-medium text-slate-900 mb-4">My Tasks by Priority</h3>
          <PriorityChart data={data.tasksByPriority} />
        </div>
      </div>

      {/* Row 3: Tasks Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900">My Tasks</h3>
            <a href="/my-tasks" className="text-sm text-blue-600 hover:text-blue-500 font-medium">View all</a>
          </div>
          <MyTasksTable tasks={data.upcomingDeadlines} />
        </div>
        
        <div className="xl:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Upcoming Deadlines</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <OverdueList tasks={data.upcomingDeadlines.concat(data.overdueTasksList).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))} />
          </div>
        </div>
      </div>

      {/* Row 4: Admin section */}
      {user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
             <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-slate-400"/> Project Progress</h3>
             <div className="space-y-4">
                {data.projectProgress?.length === 0 && <p className="text-sm text-slate-500">No active projects.</p>}
                {data.projectProgress?.map(p => (
                  <div key={p.projectId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 truncate mr-2">{p.title}</span>
                      <span className="text-slate-500 flex-shrink-0">{p.done} / {p.total} ({p.percent}%)</span>
                    </div>
                    <ProgressBar progress={p.percent} colorClass={p.percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'} />
                  </div>
                ))}
             </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
             <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-slate-400"/> Active Tasks per User</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.tasksPerUser} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fill: '#475569'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {/* Row 5: Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
        </div>
        <ActivityFeed activities={data.recentActivity} />
      </div>
      
    </div>
  );
};

const Dashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default Dashboard;
