import React, {
  memo, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import checkEqual from '../../../../Utils/checkEqual';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import Bundle from './Bundle/Bundle';
import PBodyHead from './PBodyHead';
import { Penta } from '../../../../assets';
import Loading2 from '../../../../Components/Loading2';

export function Breadcumb({ name }) {
  if (!name) {return null;}
  return (
    <span className="flex items-center text-xs font-medium capitalize">
      <Penta className="w-5 h-5 mr-2 stroke-current" />
      {`${name} /`}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks" className="animate-pulse space-y-3 py-4">
      <div className="h-6 w-40 rounded bg-text/10" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex h-12 items-center gap-3 border-b border-border">
          <div className="h-5 w-5 rounded bg-text/10" />
          <div className="h-4 flex-1 rounded bg-text/10" />
          <div className="hidden h-6 w-24 rounded-full bg-text/10 @3xl:block" />
          <div className="hidden h-6 w-20 rounded-full bg-text/10 @3xl:block" />
        </div>
      ))}
    </div>
  );
}

function PBody() {
  const { projectId } = useParams();
  const { loading, prepareViewForProject, taskLoading } = useProjectsCtx();
  const viewIds = useSelector((state) => state.projectStore.view.map((v) => v.id), checkEqual);
  const { project, folder, file } = useSelector((state) => state.breadCrumbStore);
  const scrollRef = useRef(null);
  const hasViews = viewIds.length > 0;
  const [width, setWidth] = useState(0);

  // Re-run when the project changes or the project list finishes loading.
  // prepareViewForProject is recreated on every render, so it is not a dependency.
  useEffect(() => {
    if (projectId && !loading) {prepareViewForProject(projectId);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, loading]);

  // Bundle headers and empty states stay as wide as the visible area while the table scrolls sideways
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {return undefined;}
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasViews]);

  const busy = Boolean(taskLoading?.groupChange);

  return (
    <>
      {busy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim">
          <Loading2 />
        </div>
      )}
      {hasViews ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:h-full">
          <PBodyHead />
          <div className="flex flex-wrap gap-2 pb-2 text-text-muted">
            {project?.name && (
              <>
                <Breadcumb name={project.name} />
                <Breadcumb name={folder?.name} />
                <Breadcumb name={file?.name} />
              </>
            )}
          </div>
          <div
            ref={scrollRef}
            style={{ '--pbody-w': width ? `${width}px` : '100%' }}
            className="no_taskScrollbar @container relative min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain pb-24"
          >
            <div className="w-full @3xl:w-max @3xl:min-w-full">
              {viewIds.map((id) => <Bundle key={id} viewId={id} />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="@container flex min-h-0 flex-1 flex-col px-1 py-6">
          {loading ? <TableSkeleton /> : (
            <p className="m-auto text-center text-base text-text-muted">Select a project to see its tasks</p>
          )}
        </div>
      )}
    </>
  );
}

export default memo(PBody);
