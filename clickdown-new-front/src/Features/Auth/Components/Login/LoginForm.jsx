import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../Context/AuthProvider';
import AuthButton from '../AuthButton/AuthButton';
import AuthField from '../AuthField/AuthField';
import DemoAccounts from './DemoAccounts';
import { SHOW_DEMO_ACCOUNTS } from './demoAccountList';
import { normaliseEmail, validateEmail } from '../../Utils/validation';

export default function LoginForm() {
  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const { search } = useLocation();

  const fillAccount = (email, password) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true });
    setValue('password', password, { shouldValidate: true, shouldDirty: true });
  };

  // login() resolves after the request, so isSubmitting also blocks double submits.
  const onSubmit = ({ email, password }) => login({
    email: normaliseEmail(email),
    password,
    rememberMe: remember,
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-md flex-col gap-5">
        <AuthField
          label="Email"
          autoFocus
          placeholder="you@example.com"
          autoComplete="username"
          inputMode="email"
          error={errors.email?.message}
          registration={register('email', { required: 'Enter your email', validate: validateEmail })}
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          registration={register('password', { required: 'Enter your password' })}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-base text-text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 rounded accent-brand-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            />
            Remember me
          </label>
          <Link to={`/forget/email${search}`} className="flex min-h-11 items-center rounded text-base font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">
            Forgot your password?
          </Link>
        </div>
        <AuthButton busy={isSubmitting} busyLabel="Signing in...">Sign in</AuthButton>
      </form>
      {SHOW_DEMO_ACCOUNTS && <DemoAccounts onFill={fillAccount} />}
    </>
  );
}
