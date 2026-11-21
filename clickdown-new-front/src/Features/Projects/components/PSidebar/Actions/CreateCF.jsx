import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import { setCustomField } from '../../../projectReducers';
import CreateProject from '../../ProjectCreateModal/CreateProject';
import { Plus, X } from 'lucide-react';

let optionSeq = 0;

// Dialog for creating a new custom field from the sidebar project menu
export default function CreateCF({ projectId, onClose, onCreated }) {
  const { onCFAdd } = useProjectsCtx();
  const dispatch = useDispatch();
  const customField = useSelector((state) => state.projectStore.customField);
  const projects = useSelector((state) => state.projectStore.projects);
  const { register, handleSubmit } = useForm();
  const isDropdown = customField.type === 'dropdown';
  const options = customField.dropdown ?? [];

  const addOption = () => {
    optionSeq += 1;
    dispatch(setCustomField({
      dropdown: [...options, { name: `option-new-${optionSeq}`, background: '#6239ed' }],
    }));
  };

  const removeOption = (name) => {
    dispatch(setCustomField({ dropdown: options.filter((p) => p.name !== name) }));
  };

  const submit = (data) => {
    const body = {
      ...customField,
      name: data.fieldName,
      projectId,
      projects,
    };
    if (isDropdown) {
      body.value = options.map((op) => ({
        fieldName: data[op.name],
        background: data[`${op.name}color`],
      }));
    }
    onCFAdd({ body })
      .then(() => onCreated())
      .catch((e) => {
        console.log(e);
        if (!e?.toasted) {toast.error('Could not add the column');}
      });
  };

  const field = 'h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-muted focus-visible:border-secondary focus-visible:outline-2 focus-visible:outline-secondary md:h-10';
  const label = 'mb-1 block text-sm font-medium text-text';

  return (
    <CreateProject setState={(open) => { if (!open) {onClose();} }} label="Add column">
      <div className="rounded-md bg-surface-raised p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-text">
          Add column
          <span className="ml-2 rounded bg-text/10 px-2 py-0.5 align-middle text-xs font-medium capitalize text-text">{customField.type}</span>
        </h2>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="cf-create-name" className={label}>Field name</label>
            <input
              id="cf-create-name"
              type="text"
              placeholder="Field name"
              maxLength={60}
              {...register('fieldName', { required: true, maxLength: 60 })}
              className={field}
              required
            />
          </div>
          {isDropdown && options.map((v, i) => (
            <div key={v.name}>
              <label htmlFor={`cf-create-${v.name}`} className={label}>{`Option ${i + 1}`}</label>
              <div className="flex items-center gap-2">
                <input
                  id={`cf-create-${v.name}`}
                  type="text"
                  maxLength={60}
                  {...register(v.name, { required: true, maxLength: 60 })}
                  required
                  placeholder="Option name"
                  className={`${field} min-w-0 flex-1`}
                />
                <input
                  type="color"
                  aria-label={`Option ${i + 1} colour`}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1 md:h-10 md:w-10"
                  defaultValue={v.background ?? v.color ?? '#6239ed'}
                  {...register(`${v.name}color`)}
                />
                {i !== 0 ? (
                  <button
                    type="button"
                    aria-label={`Remove option ${i + 1}`}
                    onClick={() => removeOption(v.name)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10 md:w-10"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                ) : <span className="w-11 shrink-0 md:w-10" aria-hidden="true" />}
              </div>
            </div>
          ))}
          {isDropdown ? (
            <button
              type="button"
              className="flex h-11 items-center gap-2 self-start rounded-md px-2 text-sm font-medium text-brand hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
              onClick={addOption}
            >
              <Plus size={16} aria-hidden="true" />
              Add option
            </button>
          ) : ''}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="h-11 rounded-md border border-border px-4 text-sm font-medium text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="h-11 rounded-md bg-secondary px-4 text-sm font-medium text-info hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:h-10"
              type="submit"
            >
              Add column
            </button>
          </div>
        </form>
      </div>
    </CreateProject>
  );
}
