import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: 'bg-slate-200', width: 'w-0' };
  let score = 0;
  if (password.length > 7) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score === 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
  if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/4' };
  if (score === 3) return { label: 'Strong', color: 'bg-blue-500', width: 'w-3/4' };
  if (score === 4) return { label: 'Very Strong', color: 'bg-emerald-500', width: 'w-full' };
  return { label: '', color: 'bg-slate-200', width: 'w-0' };
};

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const watchPassword = watch('password', '');
  const strength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      const response = await api.post('/auth/register', data);
      login(response.data.user, response.data.token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {serverError}
              </div>
            )}
            
            <Input
              label="Full Name"
              id="name"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <Input
                label="Password"
                id="password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
              />
              {watchPassword && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mr-2">
                    <div className={`${strength.color} ${strength.width} h-1.5 rounded-full transition-all duration-300`}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium w-16 text-right">{strength.label}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
