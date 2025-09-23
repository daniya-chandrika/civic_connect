import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, BuildingLibraryIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';

const roles = [
    { name: 'Sanitation Officer', href: '/login/sanitation-officer', icon: BriefcaseIcon, description: 'Manage sanitation-related issues and assignments.' },
    { name: 'City Engineer', href: '/login/city-engineer', icon: BuildingLibraryIcon, description: 'Oversee public works, infrastructure, and engineering tasks.' },
    { name: 'Deputy Commissioner', href: '/login/deputy-commissioner', icon: UserGroupIcon, description: 'Review and manage time-sensitive escalated issues.' },
    { name: 'Municipal Commissioner', href: '/login/municipal-commissioner', icon: UserIcon, description: 'Access high-priority escalations and system oversight.' },
];

const AdminSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Portals
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
          Please select your designated portal to continue.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Link
              key={role.name}
              to={role.href}
              className="group block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300"
            >
              <role.icon className="h-10 w-10 text-sky-500 mb-4 mx-auto" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {role.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {role.description}
              </p>
            </Link>
          ))}
        </div>
         <div className="mt-10">
            <Link to="/" className="text-sm text-sky-500 hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSelectionPage;
