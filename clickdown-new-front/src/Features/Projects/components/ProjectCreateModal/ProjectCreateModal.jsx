import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { renderToStaticMarkup } from 'react-dom/server';
import ManageAssignee from '../../../../Components/ManageAssignee';
import req from '../../../../Utils/req';
import { ProjectImg as defaultPhoto } from '../../../../assets';
import { Plus, Upload, X } from 'lucide-react';
import CreateProject from './CreateProject';
import IconList from './IconList';

const labelClass = 'mb-1 mt-3 block text-sm font-medium text-text select-none';
const inputClass = 'h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-muted focus-visible:border-secondary focus-visible:outline-2 focus-visible:outline-secondary md:h-10';
const errorClass = 'mt-1 text-xs text-danger';

/**
 * Turns one of the preset icon components into an SVG file so it can be uploaded
 * like any other project icon.
 */
function presetIconFile(name) {
  const Icon = IconList[name];
  const svg = renderToStaticMarkup(<Icon width={128} height={128} color="#6239ED" strokeWidth={2} />);
  return new File([svg], `${name}.svg`, { type: 'image/svg+xml' });
}

export default function ProjectCreateModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm({ defaultValues: { name: '', sprintLength: '' } });

  // Object URL for the chosen photo; revoked when it is replaced or the modal unmounts.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (previewUrl) {URL.revokeObjectURL(previewUrl);}
  }, [previewUrl]);

  const PresetIcon = preset ? IconList[preset] : null;

  const resetForm = () => {
    setOpen(false);
    setMembers([]);
    setFile(null);
    setPreset(null);
    reset();
  };

  // User-initiated close (buttons, backdrop, Escape); ignored while a request is in flight.
  const closeModal = () => {
    if (!submitting) {resetForm();}
  };

  const onUploadImage = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) {return;}
    setPreset(null);
    setFile(picked);
  };

  const onPickPreset = (name) => {
    setFile(null);
    setPreset(name);
    if (fileInputRef.current) {fileInputRef.current.value = '';}
  };

  const onAdd = (m) => setMembers((prev) => [...prev, m]);
  const onRemove = (m) => setMembers((prev) => prev.filter((p) => p.id !== m.id));

  const onSubmit = async (values) => {
    if (members.length < 1) {
      toast.error('Please assign at least one member');
      return;
    }
    setSubmitting(true);
    const data = {
      name: values.name.trim(),
      sprintLength: Number(values.sprintLength),
      members: members.map((m) => m.id),
    };
    const fd = new FormData();
    if (file) {fd.append('icon', file);}
    else if (preset) {fd.append('icon', presetIconFile(preset));}
    fd.append('data', JSON.stringify(data));
    try {
      await req({ method: 'POST', uri: 'project', data: fd });
      toast.success('Space created');
      setSubmitting(false);
      resetForm();
    } catch (err) {
      const message = typeof err?.response?.data === 'string' ? err.response.data : 'Something went wrong';
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border-strong text-sm font-medium text-text hover:border-secondary hover:bg-secondary/10 hover:text-brand focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add new space</span>
        </button>
      </div>

      {open ? (
        <CreateProject setState={() => closeModal()} label="Create new space">
          <div>
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 className="text-lg font-semibold text-text">Create new space</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10 md:w-10"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 pb-4 pt-1">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label htmlFor="space-name" className={labelClass}>Project name*</label>
                <input
                  id="space-name"
                  type="text"
                  maxLength={80}
                  placeholder="Project name"
                  aria-invalid={errors.name ? 'true' : undefined}
                  className={inputClass}
                  {...register('name', {
                    validate: (v) => v.trim() !== '' || 'Project name is required',
                    maxLength: { value: 80, message: 'Keep the name under 80 characters' },
                  })}
                />
                {errors.name && <p role="alert" className={errorClass}>{errors.name.message}</p>}

                <label htmlFor="space-sprint" className={labelClass}>Sprint length (days)*</label>
                <input
                  id="space-sprint"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="For example 14"
                  onWheel={(e) => e.currentTarget.blur()}
                  aria-invalid={errors.sprintLength ? 'true' : undefined}
                  className={inputClass}
                  {...register('sprintLength', {
                    required: 'Sprint length is required',
                    min: { value: 1, message: 'Sprint length must be at least 1 day' },
                    validate: (v) => Number.isInteger(Number(v)) || 'Use a whole number of days',
                  })}
                />
                {errors.sprintLength && <p role="alert" className={errorClass}>{errors.sprintLength.message}</p>}

                <div className="mt-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <div>
                    <p className={labelClass}>Assign members*</p>
                    <div className="py-1">
                      <ManageAssignee
                        assignees={members}
                        onAdd={onAdd}
                        onRemove={onRemove}
                        showAddButton={false}
                        allUser
                        position
                      />
                    </div>
                  </div>

                  <div>
                    <p className={labelClass}>Project photo</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border text-brand shadow-sm">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Project icon preview" className="h-full w-full object-cover" />
                        ) : PresetIcon ? (
                          <PresetIcon className="h-8 w-8" aria-hidden="true" />
                        ) : (
                          <img src={defaultPhoto} alt="Default project icon" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <label
                        htmlFor="space-photo"
                        className="flex h-11 cursor-pointer items-center gap-2 rounded-md bg-text/10 px-3 text-sm font-medium text-text hover:bg-text/10 focus-within:outline-2 focus-within:outline-secondary md:h-10"
                      >
                        <Upload size={16} aria-hidden="true" />
                        <span>Upload</span>
                        <input
                          ref={fileInputRef}
                          id="space-photo"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={onUploadImage}
                        />
                      </label>
                    </div>
                    <div role="group" aria-label="Preset icons" className="mt-2 grid grid-cols-6 gap-1">
                      {Object.keys(IconList).map((key) => {
                        const Icon = IconList[key];
                        const active = preset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            aria-label={`Use the ${key} icon`}
                            aria-pressed={active}
                            onClick={() => onPickPreset(key)}
                            className={`flex h-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-secondary md:h-9 ${active ? 'bg-secondary/10 ring-2 ring-secondary' : 'hover:bg-text/10'}`}
                          >
                            <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 h-11 w-full rounded-md bg-secondary text-sm font-medium text-info hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-60 md:h-10"
                >
                  {submitting ? 'Creating space...' : 'Create space'}
                </button>
              </form>
            </div>
          </div>
        </CreateProject>
      ) : null}
    </div>
  );
}
