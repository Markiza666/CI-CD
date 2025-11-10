import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Import our custom hook

// Component responsible for protecting specific routes.
// US 7.1: Ensures only authenticated users can access child routes.
const ProtectedRoute: React.FC = () => {
    // Använd vår centraliserade autentiseringsstatus
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation(); // Hämta den aktuella URL:en

    if (loading) {
        return <div className="loading-indicator">Loading authentication...</div>;
    }

    // 2. Om inloggad: Visa barnrutterna (<Outlet />)
    if (isAuthenticated) {
        return <Outlet />;
    }

    // 3. Om INTE inloggad: Omdirigera till inloggningssidan
    // Skickar med den aktuella sökvägen i state för att kunna omdirigera efter inloggning.
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
