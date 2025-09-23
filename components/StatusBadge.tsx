
import React from 'react';
import { Status } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClasses = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
