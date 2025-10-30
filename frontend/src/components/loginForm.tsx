import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';

// AC 2.1: Component responsible for user login.
const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

            // AC 2.2: On successful login, the client receives an authentication token (JWT)
            const { token } = response.data;
            
            if (token) {
                // AC 2.2: Save token in Local Storage for future protected calls
                localStorage.setItem('authToken', token);
                
                // AC 7.1: Redirect to a protected page (e.g., /profile)
                console.log("Login successful! Token saved.");
                navigate('/profile'); 
            } else {
                setError('Login failed: No token received.');
            }

        } catch (err: any) {
            // AC 2.1: Handle errors from P1's API (e.g., incorrect password/user not found)
            const errorMessage = err.response?.data?.message || 'Incorrect email or password.';
            setError(errorMessage);
        }
    };

    return (
        // AC 2.1: Login form structure
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
                {/* AC 1.1: Link to the registration page */}
                <Link to="/register" className="register-link"> 
                    Don't have an account? Register here.
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;
