import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useProjectMembers } from '../../hooks/useProjects';

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().uuid().optional().nullable().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  estimatedHours: z.number().min(0).optional().or(z.literal('')),
  labelIds: z.array(z.string().uuid()).optional()
});

const TaskForm = ({ projectId, defaultValues, onSubmit, isLoading, isEdit = false }) => {
  const { data: membersResponse } = useProjectMembers(projectId);
  const members = membersResponse?.data || [];

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.split('T')[0] : '',
      assigneeId: defaultValues?.assigneeId || '',
      estimatedHours: defaultValues?.estimatedHours || '',
      labelIds: defaultValues?.labels?.map(l => l.labelId) || []
    }
  });

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      assigneeId: data.assigneeId === '' ? null : data.assigneeId,
      estimatedHours: data.estimatedHours === '' ? null : Number(data.estimatedHours),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Input
        label="Task Title *"
        id="title"
        {...register('title')}
        error={errors.title?.message}
      />

      <div className="flex flex-col space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {!isEdit && (
          <div className="flex flex-col space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-slate-700">Status</label>
            <select id="status" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" {...register('status')}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        )}

        <div className="flex flex-col space-y-1">
          <label htmlFor="priority" className="text-sm font-medium text-slate-700">Priority</label>
          <select id="priority" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="assigneeId" className="text-sm font-medium text-slate-700">Assignee</label>
          <select id="assigneeId" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" {...register('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
        </div>

        <Input
          type="date"
          label="Due Date"
          id="dueDate"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />

        <Input
          type="number"
          step="0.5"
          label="Estimated Hours"
          id="estimatedHours"
          {...register('estimatedHours', { valueAsNumber: true })}
          error={errors.estimatedHours?.message}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
