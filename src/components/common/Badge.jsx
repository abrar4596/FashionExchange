import React from 'react';

export const ConditionBadge = ({ condition }) => {
  const styles = {
    'New with tags': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'New without tags': 'bg-teal-50 text-teal-800 border-teal-200',
    'Very good': 'bg-blue-50 text-blue-800 border-blue-200',
    'Good': 'bg-amber-50 text-amber-800 border-amber-200',
    'Satisfactory': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[condition] || 'bg-gray-50 text-gray-700 border-gray-200'
      }`}
    >
      {condition}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending_swap: 'bg-amber-100 text-amber-800 border-amber-200',
    swapped: 'bg-purple-100 text-purple-800 border-purple-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    accepted: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const labels = {
    available: 'Available to Swap',
    pending_swap: 'Swap Pending',
    swapped: 'Swapped',
    pending: 'Offer Pending',
    accepted: 'Accepted / In Chat',
    completed: 'Swap Completed',
    rejected: 'Declined',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {labels[status] || status}
    </span>
  );
};
