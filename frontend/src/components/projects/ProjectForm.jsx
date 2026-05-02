import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ON_HOLD']),
  startDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

const ProjectForm = ({ defaultValues, onSubmit, isLoading, isEdit = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      startDate: defaultValues?.startDate ? defaultValues.startDate.split('T')[0] : '',
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.split('T')[0] : '',
    }
  });

  const onFormSubmit = (data) => {
    // Convert empty strings to undefined/null for dates before submitting
    const payload = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Input
        label="Project Title *"
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

      <div className="flex flex-col space-y-1">
        <label htmlFor="status" className="text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          {...register('status')}
        >
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          type="date"
          label="Start Date"
          id="startDate"
          {...register('startDate')}
          error={errors.startDate?.message}
        />
        <Input
          type="date"
          label="Due Date"
          id="dueDate"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {isEdit ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
