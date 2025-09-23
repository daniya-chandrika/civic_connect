import React, { useState, useEffect } from 'react';
import { Citizen } from '../types';
import * as userService from '../services/userService';
import { TrophyIcon } from '@heroicons/react/24/solid';

const Leaderboard: React.FC = () => {
    const [users, setUsers] = useState<Citizen[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const fetchedUsers = await userService.getUsers();
            const sortedUsers = fetchedUsers.sort((a, b) => b.points - a.points);
            setUsers(sortedUsers);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-slate-400';
        if (rank === 2) return 'text-yellow-600';
        return 'text-slate-500 dark:text-slate-400';
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                Community Champions
            </h2>
            {loading ? (
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Loading leaderboard...</p>
            ) : (
                <ol className="space-y-4">
                    {users.map((user, index) => (
                        <li key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className={`text-lg font-bold w-8 text-center ${getRankColor(index)}`}>{index + 1}</span>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                </div>
                            </div>
                            <div className="text-sm font-semibold text-sky-500">
                                {user.points} pts
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default Leaderboard;