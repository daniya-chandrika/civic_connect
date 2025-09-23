import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { Status } from '../types';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, HomeIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
    const { userType, logout } = useAuth();
    const { issues } = useIssues();
    const navigate = useNavigate();

    // Mock personal information state
    const [name, setName] = useState('Jane Doe');
    const [email, setEmail] = useState('jane.doe@example.com');
    const [phone, setPhone] = useState('555-123-4567');
    const [address, setAddress] = useState('123 Main St, Anytown, USA');

    const userStats = useMemo(() => {
        // In a real app, issues would be filtered by the current user's ID
        const totalReports = issues.length;
        const resolvedReports = issues.filter(issue => issue.status === Status.RESOLVED).length;
        return { totalReports, resolvedReports };
    }, [issues]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would save the updated user info to a backend
        alert("Profile information saved!");
    }

    const handleBack = () => {
        if (userType) {
            navigate(`/${userType}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Profile</h1>

                    {/* User Statistics Section - Citizen only */}
                    {userType === 'citizen' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center">
                                <ArrowUpTrayIcon className="h-10 w-10 text-sky-500 mr-4"/>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Reports Submitted</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.totalReports}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center">
                                <CheckCircleIcon className="h-10 w-10 text-green-500 mr-4"/>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Issues Resolved</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.resolvedReports}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personal Information Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <UserCircleIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                     <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <PhoneIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <HomeIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Logout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;