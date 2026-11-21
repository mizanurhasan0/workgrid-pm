import React from 'react';
import Wrapper from './Components/Wrapper';
import { ForgetProvider } from './Context/ForgetProvider';

export default function Forget() {
  return (
    <ForgetProvider>
      <Wrapper />
    </ForgetProvider>
  );
}
