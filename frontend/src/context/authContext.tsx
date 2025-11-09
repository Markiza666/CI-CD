import React, { createContext, useContext, useState, useEffect } from 'react';

import { User, JwtPayload } from '../interfaces'; 
import { decodeJwt } from '../utils/jwt'; 

// Key used to store the token in LocalStorage
const AUTH_TOKEN_KEY = 'authToken';

// --- TYPDEFINITIONER ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- HJÄLPFUNKTIONER ---

/**
 * 🛠️ Steg 1: Hämta ett giltigt, o-utgånget JWT-payload.
 * Denna funktion hanterar både avkodning, kontroll av '_id'/'sub', och utgångsdatum.
 */
const getValidPayload = (token: string): JwtPayload | null => {
    const payload = decodeJwt(token);
    
    if (!payload) return null;
    
    // Kontrollera att ett användar-ID finns (antingen _id eller sub)
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
 */
const mapPayloadToUser = (payload: JwtPayload): User => {
    // Vi vet att ID finns här eftersom getValidPayload kontrollerade det
    const userId = payload._id || payload.sub || payload.userId || "";
    
    let userIdentifier: string;
    
    if (payload.email) {
        userIdentifier = payload.email.split('@')[0];
    } else {
        userIdentifier = `user_${userId.substring(0, 8)}`; 
    }

    return {
        _id: userId,
        email: payload.email || undefined,
        username: payload.username || userIdentifier,
    } as User;
}

// --- PROVIDER COMPONENT ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // Använd getValidPayload för att validera token redan vid initialiseringen
    const initialPayload = initialToken ? getValidPayload(initialToken) : null;
    const initialUser = initialPayload ? mapPayloadToUser(initialPayload) : null;
    
    // Om payloadet inte var giltigt, nollställ initialToken så att staterna matchar
    const validInitialToken = initialPayload ? initialToken : null;


    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!validInitialToken && !!initialUser);
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState<boolean>(true); // Sätt alltid till true initialt
    const [token, setToken] = useState<string | null>(validInitialToken); // Använd den validerade tokenen


    const logout = () => { // Flyttad upp för att kunna användas i useEffect
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    };
    
    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    };
    
    // OBS! useEffect behöver nu 'token' och 'logout' i dependencies.
    useEffect(() => {
        const validateTokenFromServer = async () => {
            // Kontrollera om token finns och om user inte är satt (kan hända vid refresh)
            if (token && !user) {
                const payload = getValidPayload(token);
                
                // Om token är ogiltig eller utgången (hanteras i getValidPayload)
                if (!payload) {
                    console.warn("Token was deemed invalid or expired during initialization.");
                    logout();
                    setLoading(false);
                    return;
                }
                
                // Om tokenen var giltig men user saknas (ska ej hända med ny initialisering)
                setUser(mapPayloadToUser(payload));
                setIsAuthenticated(true);
            }

            // I en riktig applikation skulle du lägga till ett serveranrop här 
            // för att verifiera tokenens giltighet, t.ex. apiClient.get('/profile').
            
            setLoading(false);
        };
        
        // Vi kör denna logik ELLER när token ändras
        validateTokenFromServer();
        
    }, [token, logout, user]); // Lägg till dependencies för att undvika varningar
    
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