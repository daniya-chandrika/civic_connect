import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types';
import StatusBadge from './StatusBadge';
import { CATEGORY_EMOJIS, PRIORITY_COLORS } from '../constants';
import { MapPinIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { formatDeadline } from '../services/issueService';

interface IssueCardProps {
  issue: Issue;
  linkTo: string;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, linkTo }) => {
    const priorityColor = PRIORITY_COLORS[issue.priority];
    const categoryEmoji = CATEGORY_EMOJIS[issue.category];

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

  return (
    <Link to={linkTo} className="block bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className={`h-2 rounded-t-lg ${priorityColor}`}></div>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start">
            <span className="text-3xl">{categoryEmoji}</span>
            <StatusBadge status={issue.status} />
        </div>
        
        <h3 className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100 truncate flex-grow">{issue.title}</h3>
        
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{issue.category}</p>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex flex-col space-y-2">
            <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2"/>
                <span>{issue.location}</span>
            </div>
            <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2"/>
                <span>Reported {timeAgo(issue.createdAt)}</span>
            </div>
             <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-2"/>
                <span>{formatDeadline(issue.deadline)}</span>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;