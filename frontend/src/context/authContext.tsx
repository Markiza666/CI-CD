// React Context
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Define type safety for the AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (newToken: string) => void;
    logout: () => void;
}

// 2. Create the Context with default undefined state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key used to store the token in LocalStorage
const AUTH_TOKEN_KEY = 'authToken';

// 3. Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
    // State hook, initialized by reading the token from LocalStorage
    const [token, setToken] = useState<string | null>(() => {
        // Initial read upon component mount
        return localStorage.getItem(AUTH_TOKEN_KEY);
    });
    
    // Calculated state
    const isAuthenticated = !!token;

    // Synchronization: Runs every time 'token' state changes
    useEffect(() => {
        if (token) {
            // Save to LocalStorage when token is set
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            console.log('Auth Token saved to localStorage.');
        } else {
            // Remove from LocalStorage when token is null (logged out)
            localStorage.removeItem(AUTH_TOKEN_KEY);
            console.log('Auth Token removed from localStorage.');
        }
    }, [token]);

    // Login function (sets state, triggering the useEffect above)
    const login = (newToken: string) => {
        setToken(newToken);
    };

    // Logout function (sets state, triggering the useEffect above)
    const logout = () => {
        setToken(null); 
    };

    const contextValue: AuthContextType = {
        isAuthenticated,
        token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
        {children}
        </AuthContext.Provider>
    );
};

// 4. Custom Hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
