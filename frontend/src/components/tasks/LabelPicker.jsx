import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import Badge from '../ui/Badge';

const LabelPicker = ({ projectId, selectedLabelIds, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: labelsData } = useQuery({
    queryKey: ['labels', projectId],
    queryFn: () => api.get(`/projects/${projectId}/labels`),
    enabled: !!projectId,
  });

  const labels = labelsData?.data || [];
  
  const toggleLabel = (labelId) => {
    if (disabled) return;
    if (selectedLabelIds.includes(labelId)) {
      onChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onChange([...selectedLabelIds, labelId]);
    }
  };

  return (
    <div className="relative">
      <div 
        className={`flex flex-wrap gap-2 p-2 border border-slate-300 rounded-md min-h-[42px] ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-blue-500'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedLabelIds.length === 0 && <span className="text-slate-400 text-sm py-1">Select labels...</span>}
        {labels.filter(l => selectedLabelIds.includes(l.id)).map(label => (
          <span 
            key={label.id}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}` }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
            {labels.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">No labels found. Ask Admin to create some.</div>
            ) : (
              labels.map((label) => (
                <div
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: label.color }} />
                    <span className="font-normal block truncate">{label.name}</span>
                  </div>
                  {selectedLabelIds.includes(label.id) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LabelPicker;
