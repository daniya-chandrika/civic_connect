import React, { useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import Header from '../components/Header';
import IssueCard from '../components/IssueCard';
import { Status } from '../types';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const MunicipalCommissionerDashboard: React.FC = () => {
  const { issues, loading, error } = useIssues();

  const escalatedIssues = useMemo(() => {
    const now = new Date().getTime();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    return issues.filter(issue => {
      const updatedAt = new Date(issue.updatedAt).getTime();
      return issue.status !== Status.RESOLVED && updatedAt <= fiveDaysAgo;
    });
  }, [issues]);

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Municipal Commissioner: High-Priority Escalations
        </h1>
        
        {loading && <p className="text-center text-slate-500 dark:text-slate-400">Loading issues...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {escalatedIssues.length > 0 ? (
              escalatedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} linkTo={`/municipal-commissioner/issue/${issue.id}`} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                <ShieldExclamationIcon className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-xl font-semibold text-slate-700 dark:text-slate-300">No High-Priority Escalations</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">All issues are being handled within the expected timeframe.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MunicipalCommissionerDashboard;
