import React from 'react';
import Badge from '../ui/Badge';
import { getPriorityColors } from '../../utils/statusColors';

const PriorityBadge = ({ priority, className = '' }) => {
  return (
    <Badge colorClass={getPriorityColors(priority)} className={className}>
      {priority}
    </Badge>
  );
};

export default PriorityBadge;
