import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Common/Loading';

const ROLE_DEFAULT_PATHS = {
  Admin: '/admin/dashboard',
  Manager: '/manager/dashboard',
  Staff: '/staff/users',
  Teacher: '/teacher/dashboard',
  User: '/family/profile'
};

/**
 * ProtectedRoute component ensures that only authenticated users with the correct role
 * can access the wrapped component. If unauthenticated, redirects to login.
 * If authenticated but with insufficient role, redirects to a role-specific default page.
 */
const ProtectedRoute = ({ allowedRoles = [], redirectTo, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role;

    if (!allowedRoles.includes(userRole)) {
      const fallbackPath = redirectTo || ROLE_DEFAULT_PATHS[userRole] || '/';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


