import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center">
      <main className="text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white">
          Welcome to <span className="text-sky-500">Civic Connect</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
          Your platform for reporting and resolving community issues. Together, we can build a better neighborhood.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/login/citizen"
            className="w-full sm:w-auto inline-block px-8 py-3 text-lg font-semibold text-white bg-sky-500 rounded-lg shadow-md hover:bg-sky-600"
          >
            Citizen Portal
          </Link>
          <Link
            to="/login/worker"
            className="w-full sm:w-auto inline-block px-8 py-3 text-lg font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600"
          >
            Worker Portal
          </Link>
          <Link
            to="/login/admin-selection"
            className="w-full sm:w-auto inline-block px-8 py-3 text-lg font-semibold text-slate-800 bg-slate-200 rounded-lg shadow-md hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
          >
            Admin Portal
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-0 py-6 text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Civic Connect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;