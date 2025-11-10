import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Import our custom hook

// Component responsible for protecting specific routes.
// US 7.1: Ensures only authenticated users can access child routes.
const ProtectedRoute: React.FC = () => {
    // Check loading state from AuthContext (loading is true until token is verified)
    const { isAuthenticated, loading } = useAuth(); 
    const location = useLocation();
    
    // 1. Wait until AuthContext has verified the token status
    if (loading) {
        // Show a loader to prevent a quick flash/redirect before the status is known
        // English comment for code standard!
        return <p className="status-message loading">Checking authorization...</p>; 
    }

    // 2. If not authenticated, redirect to /login and pass the current path in state
    if (!isAuthenticated) {
        // We use state={{ from: ... }} to save where the user wanted to go.
        // The 'replace' prop ensures the login page replaces the attempted protected route in history.
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 3. If authenticated, render the children (Outlet)
    // Outlet is necessary because ProtectedRoute is used as a wrapper <Route element={...}>
    return <Outlet />;
};

export default ProtectedRoute;
