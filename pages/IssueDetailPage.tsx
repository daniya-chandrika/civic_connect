import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { Issue, Status, Priority } from '../types';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { PRIORITY_COLORS, CATEGORY_EMOJIS, WORKERS, CATEGORY_TO_DEPARTMENT_MAP } from '../constants';
import { MapPinIcon, ClockIcon, PencilIcon, ArrowLeftIcon, CalendarDaysIcon, StarIcon } from '@heroicons/react/24/outline';
import { formatDeadline } from '../services/issueService';


const IssueDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getIssueById, updateIssue } = useIssues();
    const { userType, currentWorker } = useAuth();
    
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state for admin edits
    const [newStatus, setNewStatus] = useState<Status | undefined>();
    const [newAssignedWorker, setNewAssignedWorker] = useState<string | undefined>();
    
    // Form state for worker edits
    const [workerNote, setWorkerNote] = useState('');
    const [workerNewStatus, setWorkerNewStatus] = useState<Status | undefined>();

    const isAdminEditable = userType === 'sanitation-officer' || userType === 'city-engineer';

    useEffect(() => {
        if (!id) return;
        const fetchIssue = async () => {
            setLoading(true);
            const fetchedIssue = await getIssueById(id);
            if (fetchedIssue) {
                setIssue(fetchedIssue);
                // Admin state
                setNewStatus(fetchedIssue.status);
                setNewAssignedWorker(fetchedIssue.assignedWorker || '');
                // Worker state
                setWorkerNewStatus(fetchedIssue.status);
            } else {
                navigate(userType ? `/${userType}` : '/');
            }
            setLoading(false);
        };
        fetchIssue();
    }, [id, getIssueById, navigate, userType]);
    
    const handleAdminUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !issue) return;

        const updates: Partial<Omit<Issue, 'id' | 'history' | 'notes' | 'createdAt'>> = {};
        const noteParts: string[] = [];

        // Check for status change
        if (newStatus && newStatus !== issue.status) {
            updates.status = newStatus;
            noteParts.push(`Status updated to "${newStatus}".`);
        }

        // Check for worker change
        const currentAssignedWorker = issue.assignedWorker || '';
        const newWorker = newAssignedWorker || '';
        if (newWorker !== currentAssignedWorker) {
            updates.assignedWorker = newAssignedWorker;
            noteParts.push(`Worker assigned to ${newAssignedWorker || 'none'}.`);
        }
        
        // If the department is not set, assign it based on category.
        if (!issue.assignedTo) {
             const autoAssignedDept = CATEGORY_TO_DEPARTMENT_MAP[issue.category];
             if (autoAssignedDept) {
                updates.assignedTo = autoAssignedDept;
                noteParts.push(`Assigned to department: ${autoAssignedDept}.`);
             }
        }

        if (noteParts.length === 0) {
            setIsEditing(false);
            return;
        }

        const generatedHistoryNote = noteParts.join(' ');
        
        await updateIssue(id, updates, generatedHistoryNote);
        const updatedIssue = await getIssueById(id);
        if (updatedIssue) setIssue(updatedIssue);
        setIsEditing(false);
    };

    const handleWorkerUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !issue || !workerNewStatus || workerNewStatus === issue.status) return;

        const updates: Partial<Omit<Issue, 'id' | 'history' | 'notes' | 'createdAt'>> = {
            status: workerNewStatus,
        };
        
        let note = `Status updated to "${workerNewStatus}" by assigned worker.`;
        if (workerNote) {
            note += ` Note: ${workerNote}`;
        }

        await updateIssue(id, updates, note);
        const updatedIssue = await getIssueById(id);
        if (updatedIssue) {
            setIssue(updatedIssue);
            setWorkerNewStatus(updatedIssue.status);
        }
        setWorkerNote(''); // Reset note
    };

    if (loading) {
        return <div className="text-center p-10">Loading issue details...</div>
    }

    if (!issue) {
        return <div className="text-center p-10">Issue not found.</div>
    }
    
    const priorityColor = PRIORITY_COLORS[issue.priority];
    const categoryEmoji = CATEGORY_EMOJIS[issue.category];

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
        <Header/>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-semibold text-sky-500 hover:underline mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Dashboard
                </button>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    {issue.imageUrl && (
                        <img src={issue.imageUrl} alt={issue.title} className="w-full h-64 object-cover" />
                    )}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-5xl">{categoryEmoji}</span>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{issue.title}</h1>
                                <p className="text-md text-slate-500 dark:text-slate-400">{issue.category}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                 <StatusBadge status={issue.status} />
                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColor}`}>{issue.priority} Priority</span>
                            </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 mb-6">{issue.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                                <StarIcon className="h-5 w-5 mr-2 text-slate-400"/>
                                <strong>Priority Score:</strong><span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{issue.priorityScore}</span>
                            </div>
                             <div className="flex items-center text-slate-600 dark:text-slate-400">
                                <CalendarDaysIcon className="h-5 w-5 mr-2 text-slate-400"/>
                                <strong>Deadline:</strong><span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{formatDeadline(issue.deadline)}</span>
                            </div>
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                                <MapPinIcon className="h-5 w-5 mr-2 text-slate-400"/>
                                <strong>Location:</strong><span className="ml-2">{issue.location}</span>
                            </div>
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                                <ClockIcon className="h-5 w-5 mr-2 text-slate-400"/>
                                <strong>Reported:</strong><span className="ml-2">{new Date(issue.createdAt).toLocaleString()}</span>
                            </div>
                             <div className="flex items-center text-slate-600 dark:text-slate-400">
                                <PencilIcon className="h-5 w-5 mr-2 text-slate-400"/>
                                <strong>Last Updated:</strong><span className="ml-2">{new Date(issue.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Assignment Details</h2>
                            {issue.assignedTo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <p><strong>Department:</strong> {issue.assignedTo}</p>
                                    <p><strong>Worker:</strong> {issue.assignedWorker || 'N/A'}</p>
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">Not yet assigned.</p>
                            )}
                        </div>
                        
                        {isAdminEditable && (
                            <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Admin Actions</h2>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-sm text-sky-500 hover:underline">Edit</button>
                                    )}
                                </div>
                                {isEditing && (
                                    <form onSubmit={handleAdminUpdate} className="mt-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Status)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign Worker</label>
                                                <select value={newAssignedWorker} onChange={(e) => setNewAssignedWorker(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                    <option value="">Unassigned</option>
                                                    {WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600">Save Changes</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                        
                        {userType === 'worker' && issue.assignedWorker === currentWorker && (
                            <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Worker Actions</h2>
                                <form onSubmit={handleWorkerUpdate} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Update Status</label>
                                        <select 
                                            value={workerNewStatus} 
                                            onChange={(e) => setWorkerNewStatus(e.target.value as Status)} 
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            disabled={issue.status === Status.RESOLVED}
                                        >
                                            {issue.status === Status.SUBMITTED && <option value={Status.SUBMITTED}>Submitted</option>}
                                            <option value={Status.IN_PROGRESS}>In Progress</option>
                                            <option value={Status.RESOLVED}>Resolved</option>
                                        </select>
                                    </div>
                                    {workerNewStatus === Status.RESOLVED && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Completion Note (Optional)</label>
                                            <textarea
                                                value={workerNote}
                                                onChange={(e) => setWorkerNote(e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                placeholder="e.g., Pothole filled and leveled."
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <button 
                                            type="submit" 
                                            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:opacity-50"
                                            disabled={issue.status === Status.RESOLVED || workerNewStatus === issue.status}
                                        >
                                            Update Issue
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Issue History</h2>
                            <ul className="space-y-4">
                                {issue.history.map((entry, index) => (
                                    <li key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 font-bold">
                                                {issue.history.length - index}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                Status changed to <span className="font-bold">{entry.status}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{entry.note}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default IssueDetailPage;