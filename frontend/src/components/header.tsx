import { Link, useNavigate } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';
import { useAuth } from '../context/authContext';

// AC 7.1: Component's only responsibility is displaying navigation based on auth status.
const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth(); 

    const handleLogout = () => {
        // AC 2.3: Call centralized logout function, which updates state and localStorage
        logout(); 
        
        // AC 2.3: Redirect user after logout
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-contentainer">
                <Link to="/">
                    <h1 className="header-title">
                        Meetup App
                    </h1>
                </Link>

                <nav className="header-nav">
                    <Link to="/" className="nav-link">Meetups</Link>
                    
                    {isAuthenticated ? (
                        <>
                            <span className="profile-link-group">
                                <Link to="/profile" className="user-profile-icon" title="View Profile">
                                    <User className="user-icon" />
                                    {user && <span className="username-text">{user.firstName}</span>}
                                </Link>
                            </span>
                            
                            <button
                                type='button'
                                className="meetup-button meetup-button--secondary"
                                onClick={handleLogout}
                                title='Log out of the application'
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Utloggad vy */}
                            <Link to="/register" className="nav-link">Register</Link>
                            
                            <Link to="/login" className="login-button" title='Log in'>
                                <LogIn className="login-icon" />
                                <span>Log In</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
