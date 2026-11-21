import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';
import Loading from './Loading';
import { signinUrl } from '../Features/Auth/Utils/redirect';

export default function Private({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {return <Loading />;}
  return user?.email ? children : <Navigate to={signinUrl(location)} replace />;
}
