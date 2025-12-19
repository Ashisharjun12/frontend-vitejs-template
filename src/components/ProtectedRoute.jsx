import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';

export const ProtectedRoute = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminProtectedRoute = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is admin
  if (session.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

