import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import { Options, Tab, TopHeader } from './Handler';
import TabPanels from './Tabs';
import req from '../../../../Utils/req';
import Loading2 from '../../../../Components/Loading2';

const TAB_NAMES = ['Details', 'Activity'];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export default function MainDrawer() {
  const { projectId } = useParams();
  const { drawerRef, onDrawerHandler, updateTask } = useProjectsCtx();
  const [loaded, setLoaded] = useState({ taskId: null, data: null });
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  // 'idle' | 'saving' | 'saved', shown in the header so edits give feedback
  const [saveState, setSaveState] = useState('idle');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('Details');
  const panelRef = useRef(null);
  // True while the description editor holds changes that are not saved yet
  const dirtyRef = useRef(false);

  const drawer = useSelector((state) => state.projectStore.currentDrawer);
  const { viewId, taskId, tree } = drawer || {};
  const isOpen = Boolean(taskId);

  const view = useSelector((state) => state.projectStore.view?.find((v) => v.id === viewId));
  const tasks = view?.tasks || [];
  const bundleInfo = view?.bundleInfo;
  const projectFields = useSelector(
    (state) => state.projectStore.projects?.find((p) => p.id === projectId)?.customFields,
  );
  const projectCF = useMemo(
    () => (projectFields || []).filter((f) => f?.show === true && f?.cf),
    [projectFields],
  );
  const taskIds = tasks.map((t) => t.id);

  // Load the task details whenever the open task changes, or after an update (refreshKey).
  useEffect(() => {
    if (!taskId) {return undefined;}
    let ignore = false;
    req({ uri: `task/drawer/${taskId}` })
      .then(({ data }) => {
        if (ignore) {return;}
        setLoaded({ taskId, data: data || null });
        // A refresh after saving must not overwrite text the user is still typing
        if (!dirtyRef.current) {setDesc(data?.description || '');}
      })
      .catch(() => {
        if (ignore) {return;}
        setLoaded({ taskId, data: null });
        toast.error('Could not load task details');
      });
    return () => { ignore = true; };
  }, [taskId, refreshKey]);

  const isLoading = isOpen && loaded.taskId !== taskId;
  // While closing, keep showing the last task so the sheet does not go blank mid-slide
  const cTask = isOpen && loaded.taskId !== taskId ? null : loaded.data;

  // Every save goes through the hook, then re-reads the task so the drawer shows the result.
  const saveTask = ({ load, ...rest }) => updateTask({
    ...rest,
    load: (busy) => {
      load(busy);
      setSaveState(busy ? 'saving' : 'saved');
      if (!busy) {setRefreshKey((k) => k + 1);}
    },
  });

  // Clear the "Saved" note a moment after it appears
  useEffect(() => {
    if (saveState !== 'saved') {return undefined;}
    const t = setTimeout(() => setSaveState('idle'), 2500);
    return () => clearTimeout(t);
  }, [saveState]);

  const onDirtyChange = useCallback((dirty) => { dirtyRef.current = dirty; }, []);

  // Ask before leaving with an unsaved description. Returns true when it is fine to go on.
  const confirmLeave = useCallback(() => {
    if (!dirtyRef.current) {return true;}
    const ok = window.confirm('You have unsaved changes to the description. Discard them?');
    if (ok) {dirtyRef.current = false;}
    return ok;
  }, []);

  const onCloseDrawer = useCallback(() => {
    if (confirmLeave()) {onDrawerHandler({ open: false });}
  }, [confirmLeave, onDrawerHandler]);

  // Escape closes the drawer while it is open (popovers swallow their own Escape first).
  useEffect(() => {
    if (!isOpen) {return undefined;}
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {onCloseDrawer();}
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCloseDrawer]);

  // Browser tab close or reload with unsaved text
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) {e.preventDefault();}
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Remember the opener when the drawer opens, and return focus to it on close.
  // Keyed on open/closed only, so moving between tasks does not move focus.
  useEffect(() => {
    if (!isOpen) {return undefined;}
    const opener = document.activeElement;
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) {opener.focus();}
    };
  }, [isOpen]);

  const isReady = Boolean(cTask);
  useEffect(() => {
    if (isOpen && isReady) {panelRef.current?.focus();}
  }, [isOpen, isReady]);

  // Keep Tab inside the sheet while it is open
  const onPanelKeyDown = (e) => {
    if (e.key !== 'Tab') {return;}
    const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (nodes.length === 0) {return;}
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onTabKeyDown = (e) => {
    const index = TAB_NAMES.indexOf(activeTab);
    let next = index;
    if (e.key === 'ArrowRight') {next = (index + 1) % TAB_NAMES.length;}
    else if (e.key === 'ArrowLeft') {next = (index - 1 + TAB_NAMES.length) % TAB_NAMES.length;}
    else if (e.key === 'Home') {next = 0;}
    else if (e.key === 'End') {next = TAB_NAMES.length - 1;}
    else {return;}
    e.preventDefault();
    setActiveTab(TAB_NAMES[next]);
    document.getElementById(`drawer-tab-${TAB_NAMES[next]}`)?.focus();
  };

  const panelProps = {
    task: cTask,
    viewId,
    taskId,
    tree,
    bundleInfo,
    projectCF,
    updateTask: saveTask,
    load: saving,
    setLoad: setSaving,
    desc,
    setDesc,
    onDirtyChange,
  };

  return (
    <main
      ref={drawerRef}
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${isOpen ? 'bg-scrim opacity-100' : 'pointer-events-none bg-transparent opacity-0'}`}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        onKeyDown={onPanelKeyDown}
        className={`childSection absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-border bg-surface-raised shadow-2xl shadow-black/40 transition-transform duration-300 ease-in-out outline-hidden sm:max-w-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {isLoading ? (
          <div className="flex h-full flex-col">
            <TopHeader taskIds={[]} taskId={taskId} viewId={viewId} onCloseDrawer={onCloseDrawer} confirmLeave={confirmLeave} />
            <div className="flex flex-1 items-center justify-center"><Loading2 /></div>
          </div>
        ) : !cTask ? (taskId ? (
          <div className="flex h-full flex-col">
            <TopHeader taskIds={[]} taskId={taskId} viewId={viewId} onCloseDrawer={onCloseDrawer} confirmLeave={confirmLeave} />
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
              <p className="font-semibold text-text-muted">This task could not be loaded.</p>
              <button
                type="button"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="min-h-11 cursor-pointer rounded-md bg-brand-solid px-4 text-sm font-medium text-on-brand"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null) : (
          <div className="flex h-full min-h-0 flex-col">
            <TopHeader
              taskIds={taskIds}
              taskId={taskId}
              viewId={viewId}
              onCloseDrawer={onCloseDrawer}
              confirmLeave={confirmLeave}
              saveState={saveState}
            />
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 sm:px-8">
              <div role="tablist" aria-label="Task sections" className="flex items-center gap-1 text-sm font-medium">
                {TAB_NAMES.map((name) => (
                  <Tab
                    key={name}
                    name={name}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(name)}
                    onKeyDown={onTabKeyDown}
                  />
                ))}
              </div>
              <Options
                task={{
                  ...cTask, taskIds, taskId, viewId, tree,
                }}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
              {TAB_NAMES.map((name) => {
                const Panel = TabPanels[name];
                return (
                  <div
                    key={name}
                    role="tabpanel"
                    id={`drawer-panel-${name}`}
                    aria-labelledby={`drawer-tab-${name}`}
                    hidden={activeTab !== name}
                  >
                    <Panel {...panelProps} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <div aria-hidden="true" className="h-full w-screen cursor-pointer" onClick={onCloseDrawer} />
    </main>
  );
}
