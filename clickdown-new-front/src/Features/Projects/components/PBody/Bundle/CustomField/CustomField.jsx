import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import checkEqual from '../../../../../../Utils/checkEqual';
import { cell } from '../bundleHelpers';
import ListCustomFields from '../../../CustomFiels/ListCustomFields';

// Renders one cell per visible custom field of the project
export default function CustomField({
  tree,
  viewId,
  taskId,
  customFields,
  bundleInfo,
}) {
  const { projectId } = useParams();
  const taskInfo = {
    tree, viewId, taskId, customFields, projectId, bundleInfo,
  };
  const cfields = useSelector((state) => (state.projectStore.projects
    .find((p) => p.id === projectId)?.customFields ?? []).filter((c) => c.show), checkEqual);

  return cfields.map(({ cf }) => {
    if (!cf) {return null;}
    const saved = customFields?.find((c) => String(c?.cf?.id ?? c?.cf) === String(cf.id));
    const render = ListCustomFields[cf.type];
    return (
      <div
        key={cf.id}
        className={`${cell.custom} ${cf.type === 'dropdown' ? 'order-2 @3xl:-order-1' : 'hidden @3xl:order-none'} items-center @3xl:flex @3xl:px-2`}
      >
        {render ? render({ ...cf, result: saved?.value }, taskInfo) : null}
      </div>
    );
  });
}
