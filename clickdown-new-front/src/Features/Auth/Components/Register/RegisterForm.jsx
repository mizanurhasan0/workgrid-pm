import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../Context/AuthProvider';
import AuthButton from '../AuthButton/AuthButton';
import AuthField from '../AuthField/AuthField';
import errorMessage from '../../Utils/errorMessage';
import { normaliseEmail, validateEmail, validatePassword } from '../../Utils/validation';

const readReferrer = () => {
  try {
    return localStorage.getItem('refferer') || '';
  } catch {
    return '';
  }
};

export default function RegisterForm() {
  const { register: createUser } = useAuth();
  const navigate = useNavigate();
  const {
    register, handleSubmit, getValues, trigger, formState: { errors, isSubmitting, touchedFields },
  } = useForm({
    defaultValues: {
      name: '', email: '', password: '', re_password: '',
    },
  });

  const onSubmit = async ({ name, email, password }) => {
    const refferer = readReferrer();
    try {
      await createUser({
        name: name.trim(),
        email: normaliseEmail(email),
        password,
        ...(refferer && { refferer }),
      });
      toast.success('Account created. Please sign in.');
      navigate('/signin');
    } catch (e) {
      toast.error(errorMessage(e, 'Registration failed. Please try again.'));
    }
  };

  // Editing the password must re-check an already typed confirmation.
  const passwordReg = register('password', { required: 'Enter a password', validate: validatePassword });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-md flex-col gap-5">
      <AuthField
        label="Full name"
        autoFocus
        placeholder="Enter your name"
        autoComplete="name"
        error={errors.name?.message}
        registration={register('name', { required: 'Enter your name', validate: (v) => v.trim().length > 0 || 'Enter your name' })}
      />
      <AuthField
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        registration={register('email', { required: 'Enter your email', validate: validateEmail })}
      />
      <AuthField
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        registration={{
          ...passwordReg,
          onChange: (e) => {
            const result = passwordReg.onChange(e);
            if (touchedFields.re_password || getValues('re_password')) {trigger('re_password');}
            return result;
          },
        }}
      />
      <AuthField
        label="Confirm password"
        type="password"
        placeholder="Re-type your password"
        autoComplete="new-password"
        error={errors.re_password?.message}
        registration={register('re_password', {
          required: 'Re-type your password',
          validate: (v) => v === getValues('password') || 'Passwords do not match',
        })}
      />
      <AuthButton busy={isSubmitting} busyLabel="Creating account...">Create account</AuthButton>
    </form>
  );
}
