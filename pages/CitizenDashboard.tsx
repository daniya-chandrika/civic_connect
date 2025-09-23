import React from 'react';
import { Link } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import Header from '../components/Header';
import IssueCard from '../components/IssueCard';
import Leaderboard from '../components/Leaderboard';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const CitizenDashboard: React.FC = () => {
  const { issues, loading, error } = useIssues();
  const { currentUser } = useAuth();

  // In a real app, you would filter issues by the current user's ID
  const myIssues = issues.filter(issue => issue.reporterId === currentUser?.id);

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: My Issues */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Reported Issues</h1>
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <PlusIcon className="h-5 w-5" />
                Report New Issue
              </Link>
            </div>

            {loading && <p className="text-center text-slate-500 dark:text-slate-400">Loading issues...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myIssues.length > 0 ? (
                  myIssues.map(issue => (
                    <IssueCard key={issue.id} issue={issue} linkTo={`/citizen/issue/${issue.id}`} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No issues found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Get started by reporting your first issue.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>

        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;