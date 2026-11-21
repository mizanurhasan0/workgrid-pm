import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Switch from '../Switch/Switch';
import { useAuth } from '../../../../Context/AuthProvider';
import { useUserCtx } from '../../Context/UserContext';

const notAllowed = ['email', 'id', 'company', 'notifySubs', 'role'];

const OPTIONS = [
  {
    key: 'mobileNotification',
    id: 'settings-mobile',
    title: 'Mobile push notifications',
    text: 'Receive push notifications on mentions and comments via your mobile app.',
  },
  {
    key: 'emailNotification',
    id: 'settings-email',
    title: 'Email notifications',
    text: 'Receive emails about mentions and comments.',
  },
  {
    key: 'alwaysSendNotification',
    id: 'settings-always-email',
    title: 'Always send email notifications',
    text: 'Receive updates by email, even when you\'re active on the app.',
  },
];

export default function Settings() {
  const { updateOwn, setUser, user } = useAuth();
  const { userData, setUserData } = useUserCtx();
  const [values, setValues] = useState(() => Object.fromEntries(
    OPTIONS.map(({ key }) => [key, Boolean(user?.settings?.[key])]),
  ));
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = (e) => {
    e.preventDefault();
    const payload = { ...userData };
    delete payload.avatar;
    notAllowed.forEach((key) => delete payload[key]);
    payload.settings = { ...values };
    const fd = new FormData();
    fd.append('data', JSON.stringify(payload));
    setIsLoading(true);
    updateOwn(fd)
      .then(({ data: saved }) => {
        setUser(saved);
        setUserData(saved);
        toast.success('Settings saved.');
      })
      .catch((err) => toast.error(err?.serverMessage || 'Could not save your settings.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={saveSettings} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 divide-y divide-border overflow-y-auto px-4 py-2 sm:px-8">
        {OPTIONS.map(({ key, id, title, text }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-4">
            <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
              <span className="block text-base font-medium text-text">{title}</span>
              <span className="mt-1 block text-sm text-text-muted">{text}</span>
            </label>
            <Switch
              checked={values[key]}
              setChecked={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
              htmlFor={id}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border bg-surface-raised px-4 py-3 sm:px-8">
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-full bg-brand-solid px-8 text-sm font-medium text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60 sm:h-10 sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
