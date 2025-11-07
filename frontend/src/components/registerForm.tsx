import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// AC 1.1: Component responsible for user registration.
const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // 👈 1. NY STATE
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError('');
        setIsSuccess(false);

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!name.trim()) { // 👈 2. NY VALIDERING
            setError('Name is required.');
            return;
        }

        try {
    const response = await fetch("https://backend-api-latest-5mz4.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Registrering lyckades:", data.message);
      navigate("/login"); // eller /profile om du loggar in direkt
    } else {
      setError(data.error || "Registrering misslyckades");
    }
  } catch (err) {
    setError("Nätverksfel eller serverfel");
  }

        // try {
        //     // AC 1.2: Call P1's API (POST /api/auth/register)
        //     const response = await apiClient.post('/auth/register', {
        //         email,
        //         password,
        //         name,
        //     });

        //     // AC 1.3: Save the token and redirect on successful registration
        //     const { token } = response.data; 
        //     if (token) {
        //         // AC 1.3: Use Context to save token. Context handles LocalStorage sync.
        //         login(token); 
                
        //         setIsSuccess(true);
        //         console.log('Registration successful! Redirecting to profile.');
        //         navigate('/profile'); 
        //     }

        // } catch (err: any) {
        //     // AC 1.1: Display registration failure message (e.g., email already taken)
        //     const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
        //     setError(errorMessage);
        // }
        
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
                    <label htmlFor="register-email" className="input-label">Email:</label>
                    <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-field"
                        autoComplete="email"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="register-name" className="input-label">Name:</label>
                    <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input-field"
                        autoComplete="name"
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
                        autoComplete="new-password"
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