import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { User, JwtPayload } from '../interfaces';
import { decodeJwt } from '../utils/jwt';

// Key used to store the token in LocalStorage
const AUTH_TOKEN_KEY = 'authToken';

// --- TYPDEFINITIONER ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getValidPayload = (token: string): JwtPayload | null => {
    if (!token) return null;

    const payload = decodeJwt(token);
    
    if (!payload) return null;
    
    const userId = payload.id || payload.sub || payload.userId; 

    if (!userId) { 
        console.warn("JWT payload is missing the critical 'id', 'sub', or 'userId' field. Token ignored.");
        return null;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn("Token expired client-side.");
        return null;
    }

    return payload;
}

const mapPayloadToUser = (payload: JwtPayload): User => {
    const userId = payload.id || payload.sub || payload.userId || "";
    
    const primaryName = payload.username || payload.username; 
    let userIdentifier: string;
    
    if (payload.name) {
        userIdentifier = payload.name;
    } else if (payload.email) {
        userIdentifier = payload.email.split('@')[0]; 
    } else {
        userIdentifier = `user_${userId.substring(0, 8)}`;
    }
    
    return {
        id: userId,
        email: payload.email ?? '',
        name: userIdentifier,
        created_at: payload.created_at ?? undefined
    } as User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(initialToken);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
    }, []);
    
    const login = (newToken: string) => {
        const payload = getValidPayload(newToken);
        
        if (payload) {
            setToken(newToken);
            setUser(mapPayloadToUser(payload));
            setIsAuthenticated(true);

            localStorage.setItem(AUTH_TOKEN_KEY, newToken);

            // apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        } else {
            console.error("Attempted login with an invalid or expired token. Logging out.");
            logout(); 
        }
    };
    
    useEffect(() => {
        if (token) {
            const payload = getValidPayload(token);
            
            if (payload) {
                setUser(mapPayloadToUser(payload));
                setIsAuthenticated(true);
                
                // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
            } else {
                logout();
            }
        }
        
        setLoading(false);
        
    }, [logout, token]);

    const value = {
        isAuthenticated,
        user,
        login, 
        logout,
        loading,
        token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// --- HOOK ---
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
