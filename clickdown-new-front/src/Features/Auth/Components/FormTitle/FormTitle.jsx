import React from 'react';
import { Scrumo } from '../../../../assets';

export default function FormTitle({
  title = 'Welcome back',
  subtitle = 'Sign in to continue to Workgrid',
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2 text-center">
      <Scrumo className="mb-3 h-9 w-auto text-text" />
      <h1 className="text-2xl font-semibold leading-8 text-text">{title}</h1>
      <p className="text-base leading-6 text-text-muted text-pretty">{subtitle}</p>
    </div>
  );
}
