
import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import IssueCard from '../components/IssueCard';
import { Status } from '../types';
import { UserCircleIcon, ListBulletIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const WorkerDashboard: React.FC = () => {
  const { issues, loading, error } = useIssues();
  const { currentWorker } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');

  const { assignedIssues, completedIssues } = useMemo(() => {
    if (!currentWorker) return { assignedIssues: [], completedIssues: [] };

    const workerIssues = issues.filter(issue => issue.assignedWorker === currentWorker);
    
    const assigned = workerIssues.filter(issue => issue.status !== Status.RESOLVED);
    const completed = workerIssues.filter(issue => issue.status === Status.RESOLVED);

    return { assignedIssues: assigned, completedIssues: completed };
  }, [issues, currentWorker]);

  const issuesToDisplay = activeTab === 'assigned' ? assignedIssues : completedIssues;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Worker Dashboard</h1>
                <div className="flex items-center mt-2 text-slate-600 dark:text-slate-400">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    <p>Welcome, <span className="font-semibold">{currentWorker || 'Worker'}</span></p>
                </div>
            </div>
            <div className="flex gap-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <ListBulletIcon className="h-5 w-5 text-yellow-500" />
                    <span>Assigned: <span className="font-bold">{assignedIssues.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                    <span>Completed: <span className="font-bold">{completedIssues.length}</span></span>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`${
                            activeTab === 'assigned'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Assigned To You
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`${
                            activeTab === 'completed'
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Completed By You
                    </button>
                </nav>
            </div>
        </div>

        {loading && <p className="text-center text-slate-500 dark:text-slate-400">Loading your tasks...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {issuesToDisplay.length > 0 ? (
              issuesToDisplay.map(issue => (
                <IssueCard key={issue.id} issue={issue} linkTo={`/worker/issue/${issue.id}`} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    {activeTab === 'assigned' ? "You're all caught up!" : "No completed tasks to show."}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {activeTab === 'assigned' ? "You have no issues currently assigned to you." : "Complete an assigned task to see it here."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
