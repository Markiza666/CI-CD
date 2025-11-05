import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// AC 7.1: Component's only responsibility is displaying navigation based on auth status.
const Header: React.FC = () => {
    const navigate = useNavigate();
    // Use useAuth hook to get real-time state and functions
    const { isAuthenticated, logout } = useAuth(); 

    const handleLogout = () => {
        // AC 2.3: Call centralized logout function, which updates state and localStorage
        logout(); 
        
        // AC 2.3: Redirect user after logout
        navigate('/login', { replace: true });
        
        // Removed: window.location.reload() is no longer needed
    };

    return (
        <header className="main-header"> 
            <div className="header-container"> 
                {/* Logo / Home Link (AC 3.1: Access Meetup List) */}
                <Link to="/" className="app-logo"> 
                    Meetup App
                </Link>

                <nav className="header-nav">
                    <ul className="nav-list"> 
                        <li>
                            {/* AC 3.1: Link to view the Meetup List */}
                            <Link to="/" className="nav-link">
                                Meetups
                            </Link>
                        </li>
                        
                        {isAuthenticated ? (
                            // Logged In State (AC 7.1: Show/hide links based on status)
                            <>
                                <li>
                                    {/* AC 7.1: Link to Profile page */}
                                    <Link to="/profile" className="nav-link">
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    {/* AC 2.3: Logout button */}
                                    <button type="button"
                                        onClick={handleLogout}
                                        className="logout-button"
                                    >
                                        Log Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            // Logged Out State (AC 7.1: Show/hide links based on status)
                            <>
                                <li>
                                    {/* AC 2.1: Link to Log In form */}
                                    <Link to="/login" className="nav-link">
                                        Log In
                                    </Link>
                                </li>
                                <li>
                                    {/* AC 1.1: Link to Register form */}
                                    <Link to="/register" className="register-button">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
