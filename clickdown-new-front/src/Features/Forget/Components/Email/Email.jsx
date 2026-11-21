import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForgetCtx } from '../../Context/ForgetProvider';
import AuthButton from '../../../Auth/Components/AuthButton/AuthButton';
import AuthField from '../../../Auth/Components/AuthField/AuthField';
import errorMessage from '../../../Auth/Utils/errorMessage';
import { normaliseEmail, validateEmail } from '../../../Auth/Utils/validation';

export default function Email() {
  const { onForget } = useForgetCtx();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }) => {
    try {
      await onForget('user/forgot/password', { email: normaliseEmail(email) });
      toast.success('We sent a code to your email.');
      navigate(`/forget/otp${search}`);
    } catch (e) {
      toast.error(errorMessage(e, 'Could not send the code. Please try again.'));
    }
  };

  return (
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
      <AuthButton busy={isSubmitting} busyLabel="Sending...">Send code</AuthButton>
      <Link to={`/signin${search}`} className="flex min-h-11 items-center justify-center rounded text-base font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">
        Back to sign in
      </Link>
    </form>
  );
}
