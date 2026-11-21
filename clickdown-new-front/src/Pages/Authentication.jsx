import React from 'react';
import { Navigate } from 'react-router-dom';

// Legacy combined login / register screen. Sign in and sign up now have their own pages.
export default function Authentication() {
  return <Navigate to="/signin" replace />;
}
