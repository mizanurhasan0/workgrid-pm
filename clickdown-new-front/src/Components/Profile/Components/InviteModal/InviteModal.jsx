import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Cancel } from '../../../../assets';
import Select from '../Select/Select';
import MultiSelect from '../MultiSelect/MultiSelect';
import req from '../../../../Utils/req';
import useDialog from '../../Hooks/useDialog';

const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const SPLIT = /[\s,;]+/;

/**
 * Invite form: one or more emails (as chips), access level and projects.
 * One invitation is sent per email.
 * @param {Object} props
 * @param {function} props.setInviteModal Opens or closes the dialog.
 * @param {string} props.encryption Invite link to include in the invitation.
 * @returns {JSX.Element}
 */
export default function InviteModal({ setInviteModal, encryption }) {
  const [emails, setEmails] = useState([]);
  const [draft, setDraft] = useState('');
  const [emailError, setEmailError] = useState('');
  const [projectError, setProjectError] = useState('');
  const [access, setAccess] = useState('Member');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const ref = useRef(null);
  useDialog(ref);

  const close = () => setInviteModal(false);

  useEffect(() => {
    const onEscape = (e) => { if (e.key === 'Escape') {setInviteModal(false);} };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [setInviteModal]);

  /** Moves the typed text into chips. Returns the new list, or null when something is invalid. */
  const commitDraft = (text = draft) => {
    const parts = text.split(SPLIT).map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (parts.length === 0) {return emails;}
    const next = [...emails];
    const problems = [];
    parts.forEach((p) => {
      if (!EMAIL_PATTERN.test(p)) {problems.push(`"${p}" is not a valid email address.`);}
      else if (next.includes(p)) {problems.push(`${p} was already added.`);}
      else {next.push(p);}
    });
    setEmails(next);
    if (problems.length > 0) {
      setEmailError(problems[0]);
      setDraft(parts.filter((p) => !EMAIL_PATTERN.test(p)).join(' '));
      return null;
    }
    setEmailError('');
    setDraft('');
    return next;
  };

  const onKeyDown = (e) => {
    if (['Enter', ',', ' ', ';'].includes(e.key) && draft.trim()) {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && !draft && emails.length) {
      setEmails(emails.slice(0, -1));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const list = commitDraft();
    if (list === null) {return;}
    let ok = true;
    if (list.length === 0) {
      setEmailError('Enter at least one email address.');
      ok = false;
    }
    if (projects.length === 0) {
      setProjectError('Select at least one project.');
      ok = false;
    } else {
      setProjectError('');
    }
    if (!ok) {return;}
    setIsLoading(true);
    Promise.allSettled(list.map((email) => {
      const fd = new FormData();
      const value = {
        email,
        access: access.toLowerCase(),
        link: encryption,
        projects: JSON.stringify(projects),
      };
      Object.keys(value).forEach((key) => fd.append(key, value[key]));
      return req({ method: 'POST', uri: 'invitation', data: fd });
    }))
      .then((results) => {
        const failed = list.filter((_, i) => results[i].status === 'rejected');
        if (failed.length === 0) {
          toast.success(list.length === 1 ? 'Invitation sent.' : `${list.length} invitations sent.`);
          close();
          return;
        }
        const reason = results.find((r) => r.status === 'rejected')?.reason;
        setEmails(failed);
        setEmailError(`${reason?.serverMessage || 'Could not send'}: ${failed.join(', ')}`);
        if (failed.length < list.length) {toast.success(`${list.length - failed.length} invitation(s) sent.`);}
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="fixed inset-0 z-popover flex items-stretch justify-center bg-scrim sm:items-center sm:p-6" data-nested-modal onMouseDown={(e) => { if (e.target === e.currentTarget) {close();} }}>
      <section
        ref={ref}
        tabIndex={-1}
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="flex outline-none h-dvh w-full flex-col bg-surface-raised text-text shadow-elevated sm:h-auto sm:max-h-full sm:max-w-md sm:rounded-lg"
      >
        <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-2 sm:px-6">
            <h2 id="invite-title" className="text-lg! font-semibold">Invite members</h2>
            <button type="button" aria-label="Close invite dialog" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-brand-solid/10 focus-visible:outline-2 focus-visible:outline-focus-ring">
              <Cancel className="h-5 w-5 stroke-text" />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 sm:px-6">
            <div>
              <label htmlFor="invite-email" className="block text-base">Email</label>
              <div
                className={`mt-1 flex min-h-12 flex-wrap items-center gap-2 rounded-lg border bg-surface p-2 focus-within:ring-2 focus-within:ring-focus-ring ${emailError ? 'border-danger' : 'border-border'}`}
              >
                {emails.map((email) => (
                  <span key={email} className="flex max-w-full items-center gap-1 rounded-full bg-brand-solid/15 py-1 pl-3 pr-1 text-sm">
                    <span className="truncate">{email}</span>
                    <button type="button" aria-label={`Remove ${email}`} onClick={() => setEmails(emails.filter((x) => x !== email))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-brand-solid/20 focus-visible:outline-2 focus-visible:outline-focus-ring">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </span>
                ))}
                <input
                  id="invite-email"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  data-autofocus
                  value={draft}
                  onChange={(e) => { setDraft(e.target.value); if (emailError) {setEmailError('');} }}
                  onKeyDown={onKeyDown}
                  onBlur={() => { if (draft.trim()) {commitDraft();} }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text');
                    if (SPLIT.test(text.trim())) {
                      e.preventDefault();
                      commitDraft(`${draft} ${text}`);
                    }
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby="invite-email-hint"
                  placeholder={emails.length ? '' : 'name@example.com'}
                  className="h-8 min-w-40 flex-1 bg-transparent px-1 text-base"
                  style={{ outline: 'none' }}
                />
              </div>
              <p id="invite-email-hint" className="mt-1 text-sm text-text-muted">Press Enter or comma to add several emails.</p>
              {emailError ? <p role="alert" className="mt-1 text-sm text-danger">{emailError}</p> : null}
            </div>
            <div>
              <p className="mb-1 text-base">Access level</p>
              <Select access={access} setAccess={setAccess} />
            </div>
            <div>
              <p className="mb-1 text-base">Projects</p>
              <MultiSelect projects={projects} setProjects={(v) => { setProjects(v); setProjectError(''); }} invalid={Boolean(projectError)} />
              {projectError ? <p role="alert" className="mt-1 text-sm text-danger">{projectError}</p> : null}
            </div>
          </div>
          <div className="flex gap-3 border-t border-border px-4 py-3 sm:justify-end sm:px-6">
            <button type="button" onClick={close} disabled={isLoading} className="h-11 flex-1 rounded-full border border-border px-6 text-sm font-medium text-text-muted hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-focus-ring sm:h-10 sm:flex-none">Cancel</button>
            <button type="submit" disabled={isLoading} className="h-11 flex-1 rounded-full bg-brand-solid px-6 text-sm font-semibold text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60 sm:h-10 sm:flex-none">{isLoading ? 'Sending...' : 'Invite'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
