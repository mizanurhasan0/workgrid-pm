import React, { useState } from 'react';
import Activity from '../Activity/Activity';
import BreadCrumbs from '../BreadCrumbs/BreadCrumbs';
import Details from '../Details/Details';

const PANELS = {
  details: Details,
  activity: Activity,
};

export default function Wrapper() {
  const [type, setType] = useState('details');
  const Panel = PANELS[type];
  return (
    <section aria-label="Task details">
      <div className="border-b border-border lg:pt-16">
        <BreadCrumbs type={type} setType={setType} />
      </div>
      <div role="tabpanel" id={`act-panel-${type}`} aria-labelledby={`act-tab-${type}`} tabIndex={0} className="px-4 sm:px-6">
        <Panel />
      </div>
    </section>
  );
}
