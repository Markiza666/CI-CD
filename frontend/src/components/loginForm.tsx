import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { User } from '../interfaces';

// AC 2.1: Component responsible for user login.
const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine where the user came from (default to /profile). Used for protected routes redirection.
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile';
    
    const { login } = useAuth();

    // AC 2.2: Handles form submission and API interaction
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // AC 2.2: Call P1's API (POST /api/auth/login)
            const response = await apiClient.post<{ token: string, user: User }>('/auth/login', { 
                email, password 
            });
            
            const { token, user } = response.data; 

            // 1. Send BOTH token and user object to AuthContext to persist login state
            login(token, user); 

            // 2. Navigate to the intended page ('from') or to the profile page
            navigate(from, { replace: true }); 

        } catch (err: any) {
            // AC 2.1: Handle API errors (e.g., 401 Unauthorized)
            const errorMessage = err.response?.data?.message || 'Incorrect email or password.';
            setError(errorMessage);
        } finally {
            // Turn off loading indicator regardless of the result
            setIsLoading(false); 
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Log In</h2>
            
            {/* Error Message Display */}
            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}
            
            <form onSubmit={handleSubmit} className="form-layout">
                {/* Email Field */}
                <div className="input-group">
                    <label 
                        htmlFor="email" 
                        className="input-label"
                    >
                        Email:
                    </label>
                    <input
                        id="email" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-field"
                        placeholder="t.ex. anna.developer@mail.com"
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </div>
                
                {/* Password Field */}
                <div className="input-group">
                    <label 
                        htmlFor="password" 
                        className="input-label"
                    >
                        Password:
                    </label>
                    <input
                        id="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                        placeholder='Your password'
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                </div>
                
                <button 
                    type="submit"
                    className="submit-button"
                    disabled={isLoading} // Disable button during loading
                >
                    {isLoading ? 'Logging In...' : 'Log In'} {/* Simple loading feedback */}
                </button>
            </form>
            
            <div className="form-footer"> 
                <Link to="/register" className="register-link"> 
                    Don't have an account? Register here.
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;
