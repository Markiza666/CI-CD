import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Import our custom hook

// Component responsible for protecting specific routes.
// US 7.1: Ensures only authenticated users can access child routes.
const ProtectedRoute: React.FC = () => {
  // Use our centralized authentication status
  const { isAuthenticated } = useAuth();
  
  // Save the current location to redirect back after successful login
  const location = useLocation();

  if (!isAuthenticated) {
    // 1. If not authenticated, redirect them to the /login page.
    // 2. We pass the current location state so the login form knows 
    //    where to redirect the user after they successfully log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Outlet is used when this component wraps other routes.
  return <Outlet />;
};

export default ProtectedRoute;