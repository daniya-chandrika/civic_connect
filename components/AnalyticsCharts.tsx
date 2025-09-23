

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Issue, Category, Status } from '../types';

interface AnalyticsChartsProps {
  issues: Issue[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ issues }) => {
  const issuesByCategory = Object.values(Category).map(category => ({
    name: category,
    count: issues.filter(issue => issue.category === category).length,
  }));

  const issuesByStatus = Object.values(Status).map(status => ({
    name: status,
    value: issues.filter(issue => issue.status === status).length,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">System Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-center text-slate-700 dark:text-slate-300">Issues by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={issuesByCategory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} angle={-25} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                                borderColor: '#334155',
                                color: '#f1f5f9',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#38bdf8" name="Number of Issues" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-4 text-center text-slate-700 dark:text-slate-300">Issues by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        {/* Fix: Explicitly type the props for the label render function as 'any'.
                            Recharts provides the 'percent' property at runtime, but TypeScript
                            is unable to infer its type correctly here. */}
                        <Pie data={issuesByStatus} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {issuesByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                                borderColor: '#334155',
                                color: '#f1f5f9',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default AnalyticsCharts;