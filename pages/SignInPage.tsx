import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserParam = 'citizen' | 'worker' | 'sanitation-officer' | 'city-engineer' | 'deputy-commissioner' | 'municipal-commissioner';

const pageDetails: Record<UserParam, { title: string; description: string }> = {
    'citizen': { title: 'Citizen Sign In', description: 'Report issues and track their resolution in your community.' },
    'worker': { title: 'Worker Sign In', description: 'View your assigned tasks and update their status.' },
    'sanitation-officer': { title: 'Sanitation Officer Sign In', description: 'Access dashboard to manage sanitation-related issues.' },
    'city-engineer': { title: 'City Engineer Sign In', description: 'Access dashboard to manage public works and infrastructure.' },
    'deputy-commissioner': { title: 'Deputy Commissioner Sign In', description: 'Access dashboard to review escalated issues.' },
    'municipal-commissioner': { title: 'Municipal Commissioner Sign In', description: 'Access dashboard for high-priority escalations.' },
};

const SignInPage: React.FC = () => {
  const { type } = useParams<{ type: UserParam }>();
  const { login, userType } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userType) {
        navigate(`/${userType}`);
    }
  }, [userType, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // In a real app, you would validate credentials here.
    // For this mock, we'll just log in if fields are not empty.
    setError('');
    if (type) {
      login(type);
    } else {
      navigate('/');
    }
  };

  const details = type ? pageDetails[type] : { title: 'Sign In', description: 'Please sign in to continue.' };
  const isCitizenOrWorker = type === 'citizen' || type === 'worker';

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-slate-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{details.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{details.description}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="text-center">
            <button onClick={() => navigate(isCitizenOrWorker ? '/' : '/login/admin-selection')} className="text-sm text-sky-500 hover:underline">
                Back to {isCitizenOrWorker ? 'Home' : 'Role Selection'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;