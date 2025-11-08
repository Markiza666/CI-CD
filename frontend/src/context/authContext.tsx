// React Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../interfaces';

// 1. Define type safety for the AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (newToken: string) => void;
    logout: () => void;
    loading: boolean;
}

// 2. Create the Context with default undefined state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key used to store the token in LocalStorage
const AUTH_TOKEN_KEY = 'authToken';

// 3. Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    // Funktioner för att ändra tillstånd (mockat)
    
    // Simulerar inloggning
    const login = (username: string) => { 
        setLoading(true);
        setTimeout(() => {
            // Mock-inloggningen ska använda argumentet 'username'
            setIsAuthenticated(true);
            setToken('mock-jwt-token-12345');
            setUser({ 
                _id: 'mock-u1', 
                // Nu är 'username' tillgänglig!
                username: username || 'Markiza', 
                email: 'mock.user@systemutvecklare.se' 
            });
            setLoading(false);
        }, 500);
    };


    // Simulerar registrering (gör samma sak i mock-läge)
    const register = (username: string) => {
        login(username);
    };

    // Simulerar utloggning
    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
    };

    const value = {
        isAuthenticated,
        user,
        login,
        register,
        logout,
        loading,
        token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Custom Hook for easy consumption
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
