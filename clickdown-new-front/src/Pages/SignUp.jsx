import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthShell from '../Features/Auth/Components/AuthShell/AuthShell';
import FormTitle from '../Features/Auth/Components/FormTitle/FormTitle';
import RegisterForm from '../Features/Auth/Components/Register/RegisterForm';
import { useAuth } from '../Context/AuthProvider';

export default function SignUp() {
  const { user } = useAuth();
  if (user?.email) {return <Navigate to="/" replace />;}

  return (
    <AuthShell>
      <FormTitle title="Create your account" subtitle="Start planning your work with Workgrid" />
      <RegisterForm />
      <p className="text-base leading-6 text-text-muted">
        Already have an account?
        {' '}
        <Link to="/signin" className="inline-flex min-h-11 items-center rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">Sign in</Link>
      </p>
    </AuthShell>
  );
}
