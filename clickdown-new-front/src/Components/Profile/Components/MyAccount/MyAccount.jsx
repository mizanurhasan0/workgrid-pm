import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Upload } from '../../../../assets';
import { useAuth } from '../../../../Context/AuthProvider';
import Input from '../../../Input';
import PasswordModal from '../PasswordModal/PasswordModal';
import UserAvatar from '../UserAvatar/UserAvatar';
import { useUserCtx } from '../../Context/UserContext';

const notAllowed = ['email', 'id', 'company', 'notifySubs', 'role'];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function MyAccount({ open, setOpen }) {
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm();
  const [src, setSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, updateOwn } = useAuth();
  const { userData, setUserData } = useUserCtx();

  useEffect(() => {
    setValue('name', user?.name);
    setValue('email', user?.email);
    setValue('jobtitle', user?.jobtitle);
    setValue('department', user?.department);
    setValue('details', user?.details);
    setValue('img', user?.avatar);
  }, [user, setValue]);

  // Free the temporary preview URL when it is replaced or the form closes.
  useEffect(() => () => { if (src) {URL.revokeObjectURL(src);} }, [src]);

  /**
   * Checks the chosen photo and shows a preview. Invalid files are rejected with a message.
   * @param {Event} e The change event of the file input.
   * @returns {undefined}
   */
  const handleUploadImage = (e) => {
    const file = e?.target?.files?.[0];
    const reject = (message) => {
      toast.warning(message);
      e.target.value = '';
      setValue('img', user?.avatar);
      setSrc(null);
    };
    if (!file) {
      reject('No image selected.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject('Only image files can be used as a photo.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      reject('The photo must be smaller than 5 MB.');
      return;
    }
    setSrc(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    const payload = { ...userData };
    delete payload.avatar;
    notAllowed.forEach((key) => delete payload[key]);
    payload.name = (data.name || '').trim();
    payload.jobtitle = data.jobtitle;
    payload.department = data.department;
    payload.details = data.details;
    const fileList = data?.img;
    const userImage = fileList?.[0] && typeof fileList[0] === 'object' ? fileList[0] : undefined;
    const fd = new FormData();
    if (userImage) {fd.append('avatar', userImage);}
    fd.append('data', JSON.stringify(payload));
    setIsLoading(true);
    updateOwn(fd)
      .then(({ data: saved }) => {
        setSrc(null);
        setUser(saved);
        setUserData(saved);
        toast.success('Profile updated.');
      })
      .catch((e) => toast.error(e?.serverMessage || 'Could not update your profile.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <fieldset disabled={isLoading} className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-8">
          <legend className="sr-only">Profile</legend>
          <div className="flex items-center gap-4">
            <UserAvatar src={src || user?.avatar} alt="Your profile photo" className="h-16 w-16" />
            <div className="min-w-0">
              <label
                htmlFor="avatar"
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-alt px-4 text-sm font-semibold text-text has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring  sm:h-10"
              >
                <Upload />
                Upload photo
                <input
                  className="sr-only"
                  id="avatar"
                  type="file"
                  accept="image/*"
                  {...register('img', {
                    onChange: (e) => { handleUploadImage(e); },
                  })}
                />
              </label>
              <p className="mt-1 text-xs text-text-muted">Photos help your teammates recognize you. Max 5 MB.</p>
            </div>
          </div>
          <hr className="border-border" />
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
            <Input required register={{ ...register('name') }} label="Your full name" placeholder="e.g. John Doe" validationMsg="Enter your name" />
            <Input register={{ ...register('jobtitle') }} label="Job title" placeholder="e.g. UI/UX Designer" />
            <Input register={{ ...register('department') }} label="Department or team" placeholder="e.g. Development" />
            <Input register={{ ...register('email') }} label="Email" disabled={true} placeholder="name@example.com" />
          </div>
          <Input register={{ ...register('details') }} Variant="textarea" label="About me" className="max-h-56 min-h-24 py-3" placeholder="Let's help people know more about you." />
          <div>
            <h3 className="text-base! font-medium text-text">Password</h3>
            <p className="py-1 text-sm text-text-muted">
              You can set a permanent password if you don&apos;t want to use temporary login codes.
            </p>
            <button
              onClick={() => setOpen(!open)}
              type="button"
              className="mt-2 h-11 rounded-md border border-border bg-surface-alt px-5 text-sm font-medium text-text hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring  sm:h-10"
            >
              Set a password
            </button>
          </div>
        </fieldset>
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
      {open ? <PasswordModal open={open} setOpen={setOpen} /> : null}
    </>
  );
}
