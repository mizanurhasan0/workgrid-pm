import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Private from '../Components/Private';
import ErrorBoundary from '../Components/ErrorBoundary';
import Lazy from './Lazy';

/**
 * All routes. Wrapped in an error boundary that resets on navigation, so a failed lazy chunk shows a Reload prompt.
 * @returns {JSX.Element}
 */
export default function Routing() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Routes>
        <Route path="/invite/:username" element={<Lazy name="InviteRedirect" />} />
        <Route path="/signup" element={<Lazy name="SignUp" />} />
        <Route path="/signin" element={<Lazy name="SignIn" />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />

        <Route path="/" element={<Private><Lazy name="Dashboard" /></Private>}>
          <Route element={<Lazy name="Project" />}>
            <Route
              index
              element={(
                <div className="flex flex-col items-center justify-center h-screen page-gutter text-center">
                  <p className="text-text-muted text-balance text-xl md:text-3xl font-semibold">Select a project or create a new one to get started.</p>
                </div>
              )}
            />
            <Route path=":projectId" element={<Lazy name="PBody" />} />
          </Route>
          <Route path="notification" element={<Lazy name="Notifications" />} />
          <Route path="chat/:id" element={<Lazy name="ChatPage" />} />
        </Route>

        <Route path="call/:method/:id" element={<Private><Lazy name="CallPage" /></Private>} />
        <Route path="forget" element={<Navigate to="/forget/email" replace />} />
        <Route path="forget/:step" element={<Lazy name="ForgetPage" />} />
        <Route path="*" element={<Lazy name="NotFound" />} />
      </Routes>
    </ErrorBoundary>
  );
}
