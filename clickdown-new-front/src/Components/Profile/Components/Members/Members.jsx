import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { AddMember, SearchUser } from '../../../../assets';
import req from '../../../../Utils/req';
import Switch from '../Switch/Switch';
import UserAvatar from '../UserAvatar/UserAvatar';
import { useAuth } from '../../../../Context/AuthProvider';
import Spaces from '../Spaces/Spaces';
import InviteModal from '../InviteModal/InviteModal';
import AccessLevel from '../AccessLevel/AccessLevel';

/** Random string used to make the invite link unique. */
const saltGen = () => Math.random().toString(36).substring(2, 15);
const buildLink = (id) => `${import.meta.env.VITE_BASE_URL}/invite/${btoa(id ?? '')}shhh${saltGen()}`;
const COLUMNS = 'md:grid-cols-[minmax(0,1fr)_9rem_9rem]';

export default function Members() {
  const { user } = useAuth();
  const { pUsers } = useSelector((state) => state.projectStore);
  const linkRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [checked, setChecked] = useState(false);
  // Search text; an empty string shows every member.
  const [query, setQuery] = useState('');
  const [role, setRole] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [encryption, setEncryption] = useState(() => buildLink(user?.id));

  const q = query.trim().toLowerCase();
  const members = (pUsers || []).filter((p) => !q
    || (p.name ?? '').toLowerCase().includes(q)
    || (p.email ?? '').toLowerCase().includes(q));

  const copyLink = () => {
    navigator.clipboard?.writeText(linkRef.current?.value ?? '')
      .then(() => setCopied(true))
      .catch(() => toast.error('Could not copy the link. Copy it manually.'));
  };

  useEffect(() => {
    let active = true;
    req({ method: 'GET', uri: 'role?paginate=false' })
      .then(({ data }) => { if (active) {setRole(data);} })
      .catch(() => { if (active) {setLoadError(true); toast.error('Could not load roles.');} })
      .finally(() => { if (active) {setIsLoading(false);} });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!copied) {return undefined;}
    const t = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!['admin', 'owner'].includes(user?.role?.name || 'member')) {return null;}
  if (isLoading) {
    return (
      <div className="space-y-3 p-4 sm:px-8" role="status" aria-label="Loading members">
        {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-raised" />)}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="invite-link-toggle" className="text-base font-medium text-text">Invite link</label>
          <Switch checked={checked} setChecked={setChecked} htmlFor="invite-link-toggle" />
        </div>
        <p className="text-sm text-text-muted">
          Share this secret link to invite people to this workspace. Only users who can invite members can see this. You can
          {' '}
          <button
            type="button"
            onClick={() => { setEncryption(buildLink(user?.id)); setCopied(false); }}
            className="rounded font-medium text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            reset the link
          </button>
          {' '}
          to generate a new invite link.
        </p>
        <div className="mt-3 flex">
          <input
            type="text"
            readOnly
            aria-label="Invite link"
            ref={linkRef}
            className="h-11 min-w-0 flex-1 rounded-l-lg border border-border bg-surface-alt px-3 text-sm text-text-muted sm:h-10"
            value={checked ? encryption : 'Switch on to get a link'}
            id="link"
            name="inviteLink"
          />
          <button
            type="button"
            disabled={!checked}
            onClick={copyLink}
            className="h-11 shrink-0 rounded-r-lg bg-brand-solid px-4 text-sm font-medium text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50 sm:h-10"
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <span className="sr-only" role="status">{copied ? 'Link copied' : ''}</span>

        <hr className="my-5 border-border" />

        <h3 className="text-base! font-medium text-text">Members</h3>
        <p className="text-sm text-text-muted">People in this workspace, the spaces they belong to and their access level.</p>
        <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setInviteModal(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand-solid px-5 text-sm font-semibold text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:h-10"
          >
            <AddMember />
            Assign members
          </button>
          <div className="relative sm:w-72">
            <input
              type="search"
              aria-label="Filter members by email or name"
              placeholder="Filter by email or name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-border bg-surface pl-4 pr-10 text-sm text-text sm:h-10"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true"><SearchUser /></span>
          </div>
        </div>

        {loadError ? <p role="alert" className="mb-3 text-sm text-danger">Roles could not be loaded, so access levels cannot be changed right now.</p> : null}

        <div role="table" aria-label="Workspace members" className="pb-24">
          <div role="rowgroup" className="hidden md:block">
            <div role="row" className={`grid ${COLUMNS} gap-3 border-b border-border px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted`}>
              <span role="columnheader">User</span>
              <span role="columnheader">Spaces</span>
              <span role="columnheader">Access level</span>
            </div>
          </div>
          <div role="rowgroup" className="space-y-3 pt-3 md:space-y-0 md:pt-0">
            {members.length > 0 ? members.map((d) => (
              <div
                role="row"
                key={d.id}
                className={`grid grid-cols-2 items-center gap-x-3 gap-y-1 rounded-lg border border-border p-3 ${COLUMNS} md:rounded-none md:border-0 md:border-b md:px-2 md:py-2`}
              >
                <div role="cell" className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                  <UserAvatar alt="" src={d?.avatar} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{d?.name}</p>
                    <p className="truncate text-sm text-text-muted">{d?.email}</p>
                  </div>
                </div>
                <div role="cell"><Spaces id={d.id} /></div>
                <div role="cell" className="justify-self-end md:justify-self-start">
                  <AccessLevel
                    levels={role}
                    role={role.find((r) => r.id === d.role) || {}}
                    userId={d.id}
                    userRole={user?.role || {}}
                  />
                </div>
              </div>
            )) : (
              <p className="py-10 text-center text-sm text-text-muted">{q ? 'No members match your filter.' : 'No members yet.'}</p>
            )}
          </div>
        </div>
      </div>
      {inviteModal ? <InviteModal setInviteModal={setInviteModal} encryption={encryption} /> : null}
    </div>
  );
}
