import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Import our custom hook

// Component responsible for protecting specific routes.
// US 7.1: Ensures only authenticated users can access child routes.
const ProtectedRoute: React.FC = () => {
  // Use our centralized authentication status
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
        return <div className="loading-indicator">Loading authentication...</div>;
    }

    // 2. Om inloggad: Visa barnrutterna (<Outlet />)
    if (isAuthenticated) {
        return <Outlet />;
    }

    // 3. Om INTE inloggad: Omdirigera till inloggningssidan
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;