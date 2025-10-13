//Authentication hook

import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '../lib/apiServices';
import { setAuthToken, getAuthToken } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            // First, set user as authenticated based on token presence
            // This prevents the token from being cleared immediately on page reload
            setIsAuthenticated(true);

            // Try to verify token with backend (optional verification)
            authAPI.getProfile()
                .then(response => {
                    // Handle different response formats (mock API vs real API)
                    const data = response?.data || {};
                    const profile = data.user || data.payload?.account || data.payload?.user;
                    if (profile) {
                        setUser(profile);
                    } else {
                        // If no profile data, create a basic user object from token
                        // This ensures the user stays authenticated even if profile fetch fails
                        setUser({ token: token });
                    }
                })
                .catch((error) => {
                    console.warn('Profile fetch failed, but keeping user authenticated:', error);
                    // Don't clear the token if profile fetch fails
                    // Just create a basic user object
                    setUser({ token: token });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            const { rememberMe, ...loginData } = credentials;
            const response = await authAPI.login(loginData);

            // Handle different response formats (mock API vs real API)
            const data = response?.data || {};
            const token = data.token || data.payload?.token;
            const account = data.user || data.payload?.account || data.payload?.user;

            if (!token) {
                throw new Error('Invalid login response - no token received');
            }

            // Lưu token vào localStorage hoặc sessionStorage tùy theo rememberMe
            setAuthToken(token, rememberMe);

            // Set user data - use account if available, otherwise create basic user object
            const userData = account || { token: token };
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Optionally call logout API
        authAPI.logout().catch(() => { });
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};