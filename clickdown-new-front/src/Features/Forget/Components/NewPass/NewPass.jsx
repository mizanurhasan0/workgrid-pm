import React from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForgetCtx } from '../../Context/ForgetProvider';
import AuthButton from '../../../Auth/Components/AuthButton/AuthButton';
import AuthField from '../../../Auth/Components/AuthField/AuthField';
import errorMessage from '../../../Auth/Utils/errorMessage';
import { validatePassword } from '../../../Auth/Utils/validation';

export default function NewPass() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { onForget, frgData } = useForgetCtx();
  const {
    register, handleSubmit, getValues, trigger, formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  // The reset token only exists after the code was verified, so guard against direct visits.
  if (!frgData?.token) {return <Navigate to="/forget/email" replace />;}

  const onSubmit = async ({ password }) => {
    try {
      await onForget('user/change/password', {
        token: frgData.token,
        password,
        email: frgData.email,
      });
      toast.success('Password updated. Please sign in.');
      navigate(`/signin${search}`, { replace: true });
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update the password. Please try again.'));
    }
  };

  const passwordReg = register('password', { required: 'Enter a new password', validate: validatePassword });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-md flex-col gap-5">
      <AuthField
        label="New password"
        autoFocus
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        registration={{
          ...passwordReg,
          onChange: (e) => {
            const result = passwordReg.onChange(e);
            if (getValues('confirmPassword')) {trigger('confirmPassword');}
            return result;
          },
        }}
      />
      <AuthField
        label="Confirm new password"
        type="password"
        placeholder="Re-type your new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword', {
          required: 'Confirm your new password',
          validate: (v) => v === getValues('password') || 'Passwords do not match',
        })}
      />
      <AuthButton busy={isSubmitting} busyLabel="Resetting...">Reset password</AuthButton>
    </form>
  );
}
