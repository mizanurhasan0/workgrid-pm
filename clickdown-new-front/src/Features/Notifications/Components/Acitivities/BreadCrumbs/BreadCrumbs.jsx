import React from 'react';
import Tabs from '../../Tabs/Tabs';

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'activity', label: 'Activity' },
];

export default function BreadCrumbs({ type, setType }) {
  return (
    <Tabs tabs={tabs} value={type} onChange={setType} label="Task sections" idPrefix="act" />
  );
}
