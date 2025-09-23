import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AllowedRole = 'citizen' | 'worker' | 'sanitation-officer' | 'city-engineer' | 'deputy-commissioner' | 'municipal-commissioner';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: AllowedRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { userType } = useAuth();
  const location = useLocation();

  if (!userType || userType !== allowedRole) {
    // Redirect them to the appropriate login page.
    return <Navigate to={`/login/${allowedRole}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;