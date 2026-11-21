import React, { useEffect, useRef, useState } from 'react';
import { Cancel } from '../../../assets';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import BreadCrumbs from '../Components/BreadCrumbs/BreadCrumbs';
import Members from '../Components/Members/Members';
import MyAccount from '../Components/MyAccount/MyAccount';
import Settings from '../Components/Settings/Settings';
import useDialog from '../Hooks/useDialog';

/**
 * Settings dialog: a centred modal on desktop and a full-screen sheet on phones.
 * @returns {JSX.Element}
 */
export default function Wrapper() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('account');
  const settingRef = useRef(null);
  const { setSettingsModal } = useGlobalCtx();
  useDialog(settingRef);

  const tabs = {
    account: <MyAccount open={open} setOpen={setOpen} />,
    settings: <Settings />,
    user: <Members />,
  };

  useEffect(() => {
    const onEscape = (e) => {
      // A nested dialog (password, invite) closes first.
      if (e.key === 'Escape' && !document.querySelector('[data-nested-modal]')) {setSettingsModal(false);}
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [setSettingsModal]);

  return (
    <div
      className="fixed inset-0 z-modal flex items-stretch justify-center bg-scrim sm:items-center sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) {setSettingsModal(false);} }}
    >
      <section
        id="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        style={{ outline: 'none' }}
        ref={settingRef}
        className="relative flex outline-none h-dvh w-full flex-col overflow-hidden bg-surface-raised text-text shadow-elevated sm:h-[min(44rem,100%)] sm:max-w-3xl sm:rounded-lg sm:border sm:border-border"
      >
        <header className="flex items-center justify-between px-4 pt-2 sm:px-8 sm:pt-4">
          <h2 id="settings-title" className="text-lg! font-semibold">Settings</h2>
          <button
            type="button"
            aria-label="Close settings"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-brand-solid/10 focus-visible:outline-2 focus-visible:outline-focus-ring"
            onClick={() => setSettingsModal(false)}
          >
            <Cancel className="h-5 w-5 stroke-text" />
          </button>
        </header>
        <BreadCrumbs type={type} setType={setType} />
        <div role="tabpanel" id={`settings-panel-${type}`} aria-labelledby={`settings-tab-${type}`} className="flex min-h-0 flex-1 flex-col border-t border-border">
          {tabs[type]}
        </div>
      </section>
    </div>
  );
}
