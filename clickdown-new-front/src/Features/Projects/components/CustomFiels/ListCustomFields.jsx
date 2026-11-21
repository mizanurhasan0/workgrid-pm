import React from 'react';
import CFInput from '../PBody/Bundle/CustomField/Fields/CFInput';
import CFDueDate from '../PBody/Bundle/CustomField/Fields/Date/CFDueDate';
import StatusCell from '../PBody/Bundle/TableComponents/StatusCell/StatusCell';

const ListCustomFields = {
  dropdown: (cf, taskInfo) => <div className="flex items-center px-0.5" key={cf.id}><StatusCell key={cf.id} taskInfo={taskInfo} cf={cf} /></div>,
  number: (cf, taskInfo) => <div className="flex items-center px-0.5" key={cf.id}><CFInput taskInfo={taskInfo} cf={cf} /></div>,
  string: (cf, taskInfo) => <div className="flex items-center px-0.5" key={cf.id}><CFInput taskInfo={taskInfo} cf={cf} /></div>,
  date: (cf, taskInfo, csClass) => <div className="flex items-center px-0.5" key={cf.id}><CFDueDate taskInfo={taskInfo} cf={cf} csClass={csClass} /></div>,
};
export default ListCustomFields;
