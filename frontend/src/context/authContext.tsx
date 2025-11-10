import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Se till att dessa interfaces nu inkluderar 'name'
import { User, JwtPayload } from '../interfaces'; 
import { decodeJwt } from '../utils/jwt'; 

// Key used to store the token in LocalStorage
const AUTH_TOKEN_KEY = 'authToken';

// --- TYPDEFINITIONER ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string) => void; // Tog bort UserData här, då den ska hämtas från payload
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- HJÄLPFUNKTIONER ---

/**
 * 🛠️ Steg 1: Hämta ett giltigt, o-utgånget JWT-payload.
 */
const getValidPayload = (token: string): JwtPayload | null => {
    const payload = decodeJwt(token);
    
    if (!payload) return null;
    
    // Kontrollera att ett användar-ID finns (antingen _id, sub eller userId)
    const userId = payload._id || payload.sub || payload.userId; 

    if (!userId) { 
        console.warn("JWT payload is missing the critical '_id', 'sub', or 'userId' field. Token ignored.");
        return null;
    }

    // Kontrollera utgångsdatum (exp)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn("Token expired client-side.");
        return null; // Returnera null om den gått ut
    }

    return payload; // Returnera det giltiga payloadet
}

/**
 * 🛠️ Steg 2: Mappa det avkodade payloadet till det enklare User-objektet.
 * KORRIGERAD: Använder payload.name om det finns.
 */
const mapPayloadToUser = (payload: JwtPayload): User => {
    // Vi vet att ID finns här
    const userId = payload._id || payload.sub || payload.userId || "";
    
    let userIdentifier: string;
    
    // Använd name om det finns i payloadet
    if (payload.username) {
        userIdentifier = payload.username;
    } else if (payload.email) {
        userIdentifier = payload.email.split('@')[0];
    } else {
        // Fallback till generiskt ID om ingen identifierare finns
        userIdentifier = `user_${userId.substring(0, 8)}`; 
    }
    
    // returnerar det nu korrekta user-objektet (med det nya name-fältet)
    return {
        _id: userId,
        email: payload.email,
        name: payload.username || userIdentifier, // <-- ANVÄNDER name, inte username
    } as User;
}

// --- PROVIDER COMPONENT ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // Validera token redan vid initialiseringen
    const initialPayload = initialToken ? getValidPayload(initialToken) : null;
    const initialUser = initialPayload ? mapPayloadToUser(initialPayload) : null;
    
    // Om payloadet inte var giltigt, nollställ initialToken
    const validInitialToken = initialPayload ? initialToken : null;


    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!validInitialToken && !!initialUser);
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState<boolean>(true); 
    const [token, setToken] = useState<string | null>(validInitialToken); 


    // Använd useCallback för att stabilisera funktionen (bra praxis)
    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }, []);
    
    // Ändrat: login-funktionen behöver inte userData, den hämtar det från den nya tokenen
    const login = (newToken: string) => {
        const payload = getValidPayload(newToken);
        
        if (payload) {
            setToken(newToken);
            setUser(mapPayloadToUser(payload)); // Hämta användardata direkt från payload
            setIsAuthenticated(true);
            localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        } else {
            // Logga ut om den nya tokenen är ogiltig
            logout(); 
        }
    };
    
    useEffect(() => {
        const validateTokenLocally = () => {
            // Kontrollera vid uppstart/tokenändring
            if (token && !user) {
                const payload = getValidPayload(token);
                
                if (!payload) {
                    console.warn("Token was deemed invalid or expired during validation.");
                    logout();
                    setLoading(false);
                    return;
                }
                
                setUser(mapPayloadToUser(payload));
                setIsAuthenticated(true);
            }
            
            // Vi kör alltid denna sist för att indikera att initial laddning är klar
            setLoading(false);
        };
        
        validateTokenLocally();
        
    }, [token, logout, user]);
    
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
            {!loading && children} {/* Rendera inte barnen förrän laddning är klar */}
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