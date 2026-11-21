import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AuthShell from '../../Auth/Components/AuthShell/AuthShell';
import Email from './Email/Email';
import { FormTitle } from './Handler';
import NewPass from './NewPass/NewPass';
import Recovery from './Recovery/Recovery';

const steps = {
  email: Email,
  otp: Recovery,
  recovery: NewPass,
};

export default function Wrapper() {
  const { step } = useParams();
  const Step = Object.hasOwn(steps, step) ? steps[step] : null;

  if (!Step) {return <Navigate to="/forget/email" replace />;}

  return (
    <AuthShell>
      <FormTitle param={step} />
      <Step />
    </AuthShell>
  );
}
