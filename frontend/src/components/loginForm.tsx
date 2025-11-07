import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// AC 2.1: Component responsible for user login.
const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();// NEW: Get the location object
    const location = useLocation();
    
    // Determine where the user came from (default to /profile)
    // The state object is structured as { from: { pathname: '/desired-path' } }
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile';
    
    const { login } = useAuth();

    // AC 2.2: Handles form submission and API interaction
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // AC 2.2: Call P1's API (POST /api/auth/login)
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            const { token } = response.data;
            
            if (token) {
                // AC 2.2: Use Context to save token. Context handles LocalStorage sync.
                login(token); 
                
                console.log("Login successful! Token saved.");
                // AC 7.1: Redirect to the page the user originally tried to access
                navigate(from, { replace: true }); // CRITICAL CHANGE
            } else {
                setError('Login failed: No token received.');
            }

        } catch (err: any) {
            // AC 2.1: Handle API errors
            const errorMessage = err.response?.data?.message || 'Incorrect email or password.';
            setError(errorMessage);
        }
    };

    return (
        // ... (rest of the render logic remains the same)
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
                    />
                </div>
                
                <button 
                    type="submit"
                    className="submit-button"
                >
                    Log In
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
