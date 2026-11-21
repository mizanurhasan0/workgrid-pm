import React, { useEffect, useState } from 'react';
// import DueDate from '../../Features/Projects/components/DueDate';
// import Estimate from '../../Features/Projects/components/Estimate';
// import IssueType from '../../Features/Projects/components/IssueType/IssueType';
// import Priority from '../../Features/Projects/components/Priority';
// import SprintPoint from '../../Features/Projects/components/SprintPoint';
// import StatusCell from '../../Features/Projects/components/StatusCell/StatusCell';
import DropDown from '../DropDown';
import req from '../../Utils/req';
import AlertToster from '../AlertToster';

/**
 * Table cell that renders one custom field of a task.
 * @param {Object} props
 * @param {Object} props.customField The task's custom field entry ({cf, value}).
 * @param {Object} props.forTask The task.
 */
export default function CustomField({ customField, forTask }) {
  const [field, setField] = useState({});
  const cfId = customField?.cf;
  useEffect(() => {
    if (!cfId) {return undefined;}
    const controller = new AbortController();
    req({ method: 'GET', uri: `cf/${cfId}`, signal: controller.signal })
      .then(({ data }) => setField(data ?? {}))
      .catch((e) => {
        if (e?.code !== 'ERR_CANCELED') {AlertToster('Could not load a custom field.', 'error');}
      });
    return () => controller.abort();
  }, [cfId]);
  const components = {
    dropdown: <DropDown
      field={field}
      selected={customField}
      forTask={forTask}
    // selected={taskCustom.find((single) => single.cf === field.id)}
    />,
    // date: <DueDate
    //   field={field}
    //   selected={customField}
    //   forTask={forTask}
    // // selected={taskCustom.find((single) => single.cf === field.id)}
    // />,
    // number: <SprintPoint
    //   selected={customField}
    //   values={field.value}
    //   forTask={forTask}
    // // selected={taskCustom.find((single) => single.cf === field.id)}
    // />,
    // time: <Estimate
    //   selected={customField}
    //   values={field.value}
    //   forTask={forTask}
    // // selected={taskCustom.find((single) => single.cf === field.id)}
    // />,
    // status: <StatusCell
    //   selected={customField}
    //   values={field.value}
    //   forTask={forTask}
    // // selected={taskCustom.find((single) => single.cf === field.id)}
    // />,
    // priority: <Priority
    //   selected={customField}
    //   values={field.value}
    //   forTask={forTask}
    // // selected={taskCustom.find((single) => single.cf === field.id)}
    // />,
    // type: <IssueType
    //   values={customField.value}
    //   selected={taskCustom.find((single) => single.cf === customField.id)}
    // />,
  };

  if (!customField) {return null;}

  return (
    <div
      style={{ display: 'table-cell' }}
      className="border-b border-border
        pr-4 align-top py-[0.625rem] group-hover/cell:border-border-strong
        group-hover/cell:border-t"
    >
      {
        components[field?.type]
      }
    </div>

  );
}
