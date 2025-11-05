import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
// AC 1.1: Component responsible for user registration.
const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    const navigate = useNavigate();
    // Get the login function from context
    const { login } = useAuth(); 

    // Handles form submission (AC 1.2: Interaction with P1 API)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSuccess(false);

        // AC 1.1: Client-side validation for minimum password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        try {
            // AC 1.2: Call P1's API (POST /api/auth/register)
            const response = await apiClient.post('/auth/register', {
                email,
                password,
            });

            // AC 1.3: Save the token and redirect on successful registration
            const { token } = response.data; 
            if (token) {
                // AC 1.3: Use Context to save token. Context handles LocalStorage sync.
                login(token); 
                
                setIsSuccess(true);
                console.log('Registration successful! Redirecting to profile.');
                navigate('/profile'); 
            }

        } catch (err: any) {
            // AC 1.1: Display registration failure message (e.g., email already taken)
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        // ... (rest of the render logic remains the same)
        <div className="form-container">
            <h2 className="form-title">Register Account</h2>
            
            {/* Error Message Display */}
            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}
            {/* Success Message Display */}
            {isSuccess && <p className="success-message">Registration successful! Redirecting...</p>}

            <form onSubmit={handleSubmit} className="form-layout">
                {/* Email Field */}
                <div className="input-group">
                    <label 
                        htmlFor="register-email" 
                        className="input-label"
                    >
                        Email:
                    </label>
                    <input
                        id="register-email"
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
                        htmlFor="register-password" 
                        className="input-label"
                    >
                        Password (min 8 characters):
                    </label>
                    <input
                        id="register-password"
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
                    Register Account
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;