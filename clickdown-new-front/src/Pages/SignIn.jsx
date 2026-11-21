import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthShell from '../Features/Auth/Components/AuthShell/AuthShell';
import FormTitle from '../Features/Auth/Components/FormTitle/FormTitle';
import LoginForm from '../Features/Auth/Components/Login/LoginForm';
import { nextFromSearch } from '../Features/Auth/Utils/redirect';
import { useAuth } from '../Context/AuthProvider';

export default function SignIn() {
  const { user } = useAuth();
  const { search } = useLocation();
  if (user?.email) {return <Navigate to={nextFromSearch(search)} replace />;}

  return (
    <AuthShell>
      <FormTitle />
      <LoginForm />
      <p className="text-base leading-6 text-text-muted">
        Don&apos;t have an account?
        {' '}
        <Link to="/signup" className="inline-flex min-h-11 items-center rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">Sign up</Link>
      </p>
    </AuthShell>
  );
}
