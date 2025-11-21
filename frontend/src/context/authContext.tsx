// authContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { User, JwtPayload } from '../interfaces';
import { decodeJwt } from '../utils/jwt';

const AUTH_TOKEN_KEY = 'authToken';

interface AuthContextType {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	login: (token: string) => void;
	logout: () => void;
	loading: boolean;
	updateUser: (newUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getValidPayload = (token: string): JwtPayload | null => {
	if (!token) return null;
	const payload = decodeJwt(token);
	if (!payload) return null;

	const userId = payload.id || payload.sub || payload.userId;
	if (!userId) return null;

	if (payload.exp && payload.exp * 1000 < Date.now()) {
		console.warn("Token expired client-side.");
		return null;
	}
	return payload;
};

const mapPayloadToUser = (payload: JwtPayload): User => {
	const userId = payload.id || payload.sub || payload.userId || "";
	const userIdentifier = payload.username
		|| (payload.email ? payload.email.split('@')[0] : `user_${userId.substring(0, 8)}`);

	return {
		id: userId,
		email: payload.email,
		name: userIdentifier,
		created_at: "" // sätts senare via /profile
	};
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState<string | null>(initialToken);

	const updateUser = useCallback((newUser: Partial<User>) => {
		setUser(prev => prev ? { ...prev, ...newUser } : null);
	}, []);

	const logout = useCallback(() => {
		setIsAuthenticated(false);
		setUser(null);
		setToken(null);
		localStorage.removeItem(AUTH_TOKEN_KEY);
	}, []);

	const login = (newToken: string) => {
		const payload = getValidPayload(newToken);
		if (payload) {
			setToken(newToken);
			setUser(mapPayloadToUser(payload));
			setIsAuthenticated(true);
			localStorage.setItem(AUTH_TOKEN_KEY, newToken);
		} else {
			logout();
		}
	};

	useEffect(() => {
		if (token) {
			const payload = getValidPayload(token);
			if (payload) {
				setUser(mapPayloadToUser(payload));
				setIsAuthenticated(true);
			} else {
				logout();
			}
		}
		setLoading(false);
	}, [logout, token]);

	const value: AuthContextType = {
		isAuthenticated,
		user,
		login,
		logout,
		loading,
		token,
		updateUser,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
};
