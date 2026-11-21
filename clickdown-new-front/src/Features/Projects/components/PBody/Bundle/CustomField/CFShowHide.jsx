import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Delete, Edit, Hidden, Show,
} from '../../../../../../assets';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import { resetCustomField, setCustomField, setUpdateProject } from '../../../../projectReducers';
import req from '../../../../../../Utils/req';
import ActionModal from '../../../../../../Components/Modal/ActionModal';

const iconClass = 'h-5 w-5 cursor-pointer opacity-70 group-hover:opacity-100 dark:stroke-text';
const iconBtn = 'inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-text/8 focus-visible:outline-2 focus-visible:outline-secondary';

export default function CFShowHide({ customFields, onEdit: openEdit }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const { updateProject } = useProjectsCtx();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const project = useSelector(
    (state) => state.projectStore.projects.find((p) => p.id === projectId),
  );
  const shown = customFields.filter((c) => c.show);
  const hidden = customFields.filter((c) => !c.show);

  // Save the column list. The store is updated first and rolled back if the request fails.
  const saveFields = (nextFields) => {
    if (!project) {return Promise.reject(new Error('Project not found'));}
    const previous = project.customFields;
    dispatch(setUpdateProject({ ...project, customFields: nextFields }));
    return updateProject({
      id: projectId,
      payload: {
        customFields: nextFields.map((c) => ({ cf: c.cf.id, show: c.show })),
      },
    }).catch((e) => {
      dispatch(setUpdateProject({ ...project, customFields: previous }));
      toast.error('Could not update the columns');
      throw e;
    });
  };

  const onToggleShow = ({ cf, show }) => {
    const next = (project?.customFields ?? []).map((c) => (c.cf.id === cf.id ? { cf, show } : c));
    saveFields(next)
      .then(() => dispatch(resetCustomField()))
      .catch(() => {});
  };

  const onEdit = (cf) => {
    if (cf.type === 'dropdown') {
      dispatch(setCustomField({
        type: cf.type,
        dropdown: [{ name: 'option0', color: '#000000' }],
        cf: { ...cf, value: (cf.value ?? []).map((c, i) => ({ ...c, name: `option${i}` })) },
      }));
    } else {dispatch(setCustomField({ type: cf.type, cf }));}
    openEdit?.(cf);
  };

  // Removes the field from the project, then deletes the field itself
  const onDelete = (cf) => {
    const next = (project?.customFields ?? []).filter((c) => c.cf.id !== cf.id);
    saveFields(next)
      .then((res) => {
        if (res?.data?.id === projectId) {
          return req({ uri: `cf/del/${cf.id}`, method: 'DELETE' })
            .catch(() => toast.error('Could not delete the field'));
        }
        return undefined;
      })
      .catch(() => {});
  };

  return (
    <div>
      <div>
        <h4 className="font-semibold uppercase text-xs text-text-muted bg-surface-alt text-center py-2">Shown</h4>
        <div className="px-2 py-1">
          {
            shown.length > 0 ? shown.map(({ cf }) => (
              <div key={cf.id} className="group flex min-h-11 items-center justify-between rounded pl-1 hover:bg-text/8">
                <p className="min-w-0 truncate text-sm capitalize">{cf.name}</p>
                <div className="flex shrink-0 items-center">
                  {cf.name?.toLowerCase() !== 'status' && (
                    <button type="button" aria-label={`Edit ${cf.name}`} onClick={() => onEdit(cf)} className={iconBtn}>
                      <Edit className={iconClass} />
                    </button>
                  )}
                  <button type="button" aria-label={`Hide ${cf.name}`} onClick={() => onToggleShow({ cf, show: false })} className={iconBtn}>
                    <Hidden className={iconClass} />
                  </button>
                </div>
              </div>
            ))
              : (
                <h1 className="py-2 text-center text-sm text-text-muted">No shown columns</h1>
              )
          }
        </div>
      </div>
      {/* fields in  the space */}
      <div>
        <h4 className="font-semibold uppercase text-xs text-text-muted bg-surface-alt text-center py-2">Hidden</h4>
        <div className="px-2 py-1">
          {
            hidden.length > 0 ? hidden.map(({ cf }) => (
              <div key={cf.id} className="group flex min-h-11 items-center justify-between rounded pl-1 hover:bg-text/8">
                <p className="min-w-0 truncate text-sm capitalize">{cf.name}</p>
                <div className="flex shrink-0 items-center">
                  {cf.name?.toLowerCase() !== 'status' && (
                    <button type="button" aria-label={`Delete ${cf.name}`} onClick={() => setPendingDelete(cf)} className={iconBtn}>
                      <Delete className={iconClass} />
                    </button>
                  )}
                  <button type="button" aria-label={`Show ${cf.name}`} onClick={() => onToggleShow({ cf, show: true })} className={iconBtn}>
                    <Show className={iconClass} />
                  </button>
                </div>
              </div>
            ))
              : (
                <h1 className="py-2 text-center text-sm text-text-muted">No hidden columns</h1>
              )
          }
        </div>
      </div>
      {/* One confirmation for the field picked above */}
      <ActionModal
        show={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onClick={() => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (target) {onDelete(target);}
        }}
      />
    </div>
  );
}
