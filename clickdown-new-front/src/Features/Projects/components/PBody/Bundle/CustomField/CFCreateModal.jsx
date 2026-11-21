 
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { resetCustomField, setCustomField } from '../../../../projectReducers';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import Modal from '../../../../../../Components/Modal/Modal';

let optionSeq = 0;

const labelClass = 'mb-1 block text-sm font-medium';
const inputClass = 'h-11 w-full rounded-md border border-border bg-transparent px-3 text-sm focus-visible:border-secondary focus-visible:outline-2 focus-visible:outline-secondary';

export default function CFCreateModal({ open = false, onClose = () => {} }) {
  const { onCFAdd, onUpdateCF } = useProjectsCtx();
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { customField } = useSelector((state) => state.projectStore);
  const projects = useSelector((state) => state.projectStore.projects);
  const {
    register, handleSubmit, setValue, reset,
  } = useForm();

  const close = () => {
    onClose();
    dispatch(resetCustomField());
  };

  // CF Create field
  const setCFInfo = (data) => {
    try {
      let obj = { name: data.fieldName };
      if (!data.fieldName) {throw new Error(toast.warning('Name not found'));}
      if (customField.type === 'dropdown') {
        const value = customField.dropdown.map((op) => {
          if (['', undefined, null].includes(op.name)) {throw new Error(toast.warning('Options not found', 'error'));}
          return { fieldName: data[op.name], background: data[`${op.name}color`] };
        });
        obj = { ...obj, value };
      }
      onCFAdd({
        body: {
          ...customField, ...obj, projectId, projects,
        },
      }).then(() => {
        onClose();
      })
        .catch((e) => {
          console.log(e);
          if (!e?.toasted) {toast.error('Could not save the field');}
        });
    } catch (error) {
      console.log(error);
    }
  };
  // CF Update field
  const setUpdateCFInfo = (data) => {
    try {
      if (!data.fieldName) {throw new Error(toast.warning('Name not found'));}
      if (customField.type === 'dropdown') {
        data.value = customField.cf.value.map((op) => (
          { fieldName: data[op.name], background: data[`${op.name}color`] }));
        if (data.value.length < 2) {throw new Error(toast.warning('Atleast two option required!'));}
      }
      onUpdateCF({
        body: {
          projectId,
          projects,
          value: data?.value,
          name: data.fieldName,
          cfId: customField.cf.id,
          type: customField.type,
        },
      }).then(() => {
        close();
      }).catch((c) => {
        console.log(c);
        if (!c?.toasted) {toast.error('Could not save the field');}
      });
    } catch (error) {
      console.log(error);
    }
  };
  // Option names are form field keys, so each new one must be unique
  const addOptions = () => {
    optionSeq += 1;
    const option = { name: `option-new-${optionSeq}`, background: '#000000' };
    if (customField?.cf) {
      dispatch(setCustomField({ cf: { ...customField.cf, value: [...customField.cf.value, option] } }));
    } else {dispatch(setCustomField({ dropdown: [...customField.dropdown, option] }));}
  };
  const onDeleteOptions = (v) => {
    if (customField?.cf) {
      dispatch(setCustomField({
        cf: { ...customField.cf, value: customField.cf.value.filter((p) => p.name !== v.name) },
      }));
    } else {
      dispatch(setCustomField({
        dropdown: customField.dropdown.filter((p) => p.name !== v.name),
      }));
    }
  };

  useEffect(() => {
    if (customField?.cf) {
      setValue('fieldName', customField.cf.name);
      if (customField.cf.type === 'dropdown') {
        customField.cf.value.forEach((v) => {
          setValue(v.name, v.fieldName);
          setValue(`${v.name}color`, v.background);
        });
      }
    } else {reset();}
  // Form values only need re-syncing when the field type or the field being edited changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customField.type]);

  const isEdit = Boolean(customField?.cf);
  const options = customField.type === 'dropdown' ? (isEdit ? customField.cf.value : customField.dropdown) : [];

  return (
    <Modal show={open} onClose={close} title={isEdit ? 'Edit column' : 'New column'} size="sm" mobile="sheet">
      <form onSubmit={(e) => handleSubmit(isEdit ? setUpdateCFInfo : setCFInfo)(e)} className="grid gap-3">
        <div>
          <label htmlFor="cf-field-name" className={labelClass}>Column Name</label>
          <input id="cf-field-name" type="text" placeholder="Field Name" {...register('fieldName')} defaultValue={customField?.cf?.name} className={inputClass} required />
        </div>
        {options?.map((v, i) => (
          <div key={v.name}>
            <label htmlFor={`cf-option-${i}`} className={labelClass}>{`Option ${i + 1}`}</label>
            <div className="flex items-center gap-2">
              <input id={`cf-option-${i}`} type="text" defaultValue={v.fieldName} {...register(v.name)} required placeholder={`Option ${i + 1}`} className={`${inputClass} min-w-0 flex-1`} />
              <input
                type="color"
                aria-label={`Option ${i + 1} colour`}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                defaultValue={v.background}
                {...register(`${v.name}color`)}
              />
              <button
                type="button"
                aria-label={`Remove option ${i + 1}`}
                title="Remove option"
                className={`${i === 0 ? 'invisible' : ''} inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-secondary`}
                disabled={i === 0}
                onClick={() => onDeleteOptions(v)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        ))}
        {customField.type === 'dropdown' ? (
          <button type="button" className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-secondary" onClick={addOptions}>
            <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-solid text-sm text-on-brand">+</span>
            Add New Option
          </button>
        ) : null}
        <div className="mt-2 flex justify-end gap-2 max-sm:flex-col-reverse max-sm:[&>button]:w-full">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-md border border-border px-4 text-sm font-medium hover:bg-text/8"
            onClick={close}
          >
            Cancel
          </button>
          <button className="min-h-11 cursor-pointer rounded-md bg-brand-solid px-4 text-sm font-medium text-on-brand hover:opacity-90" type="submit">{isEdit ? 'Update Column' : 'Add Column'}</button>
        </div>
      </form>
    </Modal>
  );
}
