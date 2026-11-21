import React, { useId } from 'react';
import Modal from './Modal';
import { Delete } from '../../assets';

/**
 * Confirmation dialog for destructive actions. Escape, backdrop press and Cancel close it; a bottom sheet on phones.
 * @param {Object} props
 * @param {boolean} props.show Whether the dialog is open.
 * @param {function} props.onClose Called on Cancel, Escape, backdrop press or the close button.
 * @param {function} props.onClick Called when Delete is confirmed.
 * @returns {JSX.Element}
 */
export default function ActionModal({ show, onClose = () => { }, onClick = () => { } }) {
  const titleId = useId();

  return (
    <Modal show={show} onClose={onClose} ariaLabelledBy={titleId} size="sm" mobile="sheet">
      <div className="grid gap-6">
        <div className="flex gap-4 items-start">
          <div className="flex items-center justify-center relative">
            <div className="bg-danger-soft w-12 h-12 p-2 rounded-full">
              <div className="bg-danger/20 w-8 h-8 p-1 rounded-full">
                <Delete className="stroke-danger h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <h2 id={titleId} className="text-danger font-semibold">Remove</h2>
            <p className="text-base text-text-muted">Are you sure you want to remove this item? This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end max-sm:flex-col-reverse max-sm:[&>button]:w-full">
          <button type="button" onClick={onClose} className="min-h-control-lg rounded-control border border-border-strong px-5 font-semibold text-text hover:bg-surface-alt">Cancel</button>
          <button type="button" className="min-h-control-lg rounded-control bg-danger-solid px-5 font-semibold text-on-brand hover:bg-danger-solid-hover" onClick={onClick}>Delete</button>
        </div>
      </div>
    </Modal>
  );
}
