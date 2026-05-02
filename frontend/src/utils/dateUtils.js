import { format, isPast, isToday, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  return format(parseISO(dateString), formatStr);
};

export const isOverdue = (dateString, status) => {
  if (!dateString || status === 'DONE') return false;
  const date = parseISO(dateString);
  // If it's today, it's not overdue yet
  if (isToday(date)) return false;
  return isPast(date);
};

export const daysUntil = (dateString) => {
  if (!dateString) return null;
  return differenceInDays(parseISO(dateString), new Date());
};
