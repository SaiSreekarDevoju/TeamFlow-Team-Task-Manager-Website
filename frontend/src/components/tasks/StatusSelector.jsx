import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import Badge from '../ui/Badge';
import { getStatusColors } from '../../utils/statusColors';

const StatusSelector = ({ status, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DONE', label: 'Done' },
    { value: 'BLOCKED', label: 'Blocked' }
  ];

  const currentStatus = statuses.find(s => s.value === status) || statuses[0];

  const handleSelect = (newStatus) => {
    onChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between w-full px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center">
          <Badge colorClass={getStatusColors(currentStatus.value)} className="mr-2">
            {currentStatus.label}
          </Badge>
        </div>
        {!disabled && <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5">
            {statuses.map((s) => (
              <div
                key={s.value}
                onClick={() => handleSelect(s.value)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-50"
              >
                <Badge colorClass={getStatusColors(s.value)}>
                  {s.label}
                </Badge>
                {status === s.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusSelector;
