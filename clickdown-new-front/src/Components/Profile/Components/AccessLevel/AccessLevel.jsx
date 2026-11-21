import React, { useId, useState } from 'react';
import { toast } from 'react-toastify';
import { Arrowdown } from '../../../../assets';
import { useAuth } from '../../../../Context/AuthProvider';
import { useUserCtx } from '../../Context/UserContext';
import useDisclosure from '../../Hooks/useDisclosure';

/**
 * Access level of one member. Admins and owners can change it; owners and yourself are read-only.
 * @param {Object} props
 * @param {Array} props.levels All roles.
 * @param {string} props.userId Member id.
 * @param {Object} props.role Current role object.
 * @param {Object} props.userRole Role of the signed-in user.
 * @returns {JSX.Element}
 */
export default function AccessLevel({
  levels = [], userId, role, userRole,
}) {
  const {
    open, setOpen, toggle, rootRef, triggerRef,
  } = useDisclosure();
  const menuId = useId();
  const { user } = useAuth();
  // Role chosen in this session; falls back to the role from the parent list.
  const [chosenRole, setChosenRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const current = chosenRole || role || {};
  const { onUpdateRole } = useUserCtx();
  const label = current.name || 'Member';
  const locked = current.name === 'owner' || userId === user?.id || !['admin', 'owner'].includes(userRole?.name);

  const onChangeRole = (data) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (data.id === current.id) {return;}
    setSaving(true);
    onUpdateRole({ body: { role: data.id, id: userId } })
      .then(() => {
        setChosenRole(data);
        toast.success('Access level updated.');
      })
      .catch((e) => toast.error(e?.serverMessage || e?.message || 'Could not update the role.'))
      .finally(() => setSaving(false));
  };

  if (locked) {
    return <span className="inline-flex min-h-10 items-center px-2 text-sm capitalize md:-ml-2 text-text-muted">{label}</span>;
  }
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={saving}
        onClick={toggle}
        className="flex min-h-11 items-center gap-2 rounded-md px-2 md:-ml-2 text-sm capitalize text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-60 md:min-h-10"
      >
        <span>{saving ? 'Saving...' : label}</span>
        <Arrowdown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
        <span className="sr-only">{`Change access level of this member (currently ${label})`}</span>
      </button>
      {open ? (
        <div id={menuId} role="menu" className="absolute left-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface-raised py-1 shadow-elevated md:left-auto md:right-0">
          {levels.filter((l) => l.name !== 'owner').length > 0 ? levels.filter((l) => l.name !== 'owner').map((u) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={u.id === current.id}
              onClick={() => onChangeRole(u)}
              key={u.id}
              className={`block min-h-11 w-full px-4 text-left text-sm capitalize text-text hover:bg-brand-solid hover:text-on-brand focus-visible:bg-brand-solid focus-visible:text-on-brand focus-visible:outline-none ${u.id === current.id ? 'font-semibold' : ''}`}
            >
              {u?.name}
            </button>
          )) : <p className="px-4 py-3 text-sm text-text-muted">No roles found.</p>}
        </div>
      ) : null}
    </div>
  );
}
