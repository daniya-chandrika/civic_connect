import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import IssueCard from '../components/IssueCard';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { Status, Category, Priority } from '../types';

const AdminDashboard: React.FC = () => {
  const { issues, loading, error } = useIssues();
  const { userType } = useAuth();

  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const officerVisibleIssues = useMemo(() => {
    if (userType === 'sanitation-officer') {
        return issues.filter(issue => issue.assignedTo === 'Sanitation');
    }
    if (userType === 'city-engineer') {
        // City Engineer sees everything that isn't explicitly for Sanitation.
        return issues.filter(issue => issue.assignedTo !== 'Sanitation');
    }
    // Fallback for any other potential admin type, shows all
    return issues; 
  }, [issues, userType]);

  const filteredIssues = useMemo(() => {
    return officerVisibleIssues.filter(issue => {
      const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
      const priorityMatch = filterPriority === 'all' || issue.priority === filterPriority;
      return statusMatch && categoryMatch && priorityMatch;
    });
  }, [officerVisibleIssues, filterStatus, filterCategory, filterPriority]);

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterPriority('all');
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="mb-8">
            <AnalyticsCharts issues={officerVisibleIssues} />
        </div>

        <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Status</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Category</label>
                    <select
                        id="category-filter"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">All Categories</option>
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="priority-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Priority</label>
                    <select
                        id="priority-filter"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">All Priorities</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleClearFilters}
                    className="w-full md:w-auto px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                >
                    Clear Filters
                </button>
            </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Reported Issues ({filteredIssues.length})</h1>

        {loading && <p className="text-center text-slate-500 dark:text-slate-400">Loading issues...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIssues.length > 0 ? (
              filteredIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} linkTo={`/${userType}/issue/${issue.id}`} />
              ))
            ) : (
                <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No issues match your filters.</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting or clearing the filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
