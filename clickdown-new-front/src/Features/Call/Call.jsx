import React from 'react';
import Wrapper from './Components/Wrapper';
import { CallProvider } from './Context/CallProvider';

export default function Call() {
  return (
    <CallProvider>
      <Wrapper />
    </CallProvider>
  );
}
