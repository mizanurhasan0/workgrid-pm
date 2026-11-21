import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import IncommingCall from './Components/IncommingCall/IncommingCall';
import Routing from './Features/Routing';
import { useTheme } from './Components/Theme/theme';

export default function App() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-app text-text">
      <Routing />
      <IncommingCall />
      <ToastContainer position="top-right" autoClose={4000} newestOnTop pauseOnFocusLoss={false} theme={theme} />
    </div>
  );
}
