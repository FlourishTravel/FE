import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'flourish_user';

// Data cứng: tài khoản mẫu để đăng nhập
export const MOCK_CREDENTIALS = {
    email: 'demo@flourish.com',
    password: 'flourish123',
};

export const MOCK_USER = {
    id: 1,
    email: MOCK_CREDENTIALS.email,
    name: 'Nguyễn Văn Demo',
    phone: '0901 234 567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    joinedDate: '01/2025',
};

const AuthContext = createContext(null);

const getStoredUser = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const checkCredentials = (email, password) => {
        return (
            email.toLowerCase().trim() === MOCK_CREDENTIALS.email &&
            password === MOCK_CREDENTIALS.password
        );
    };

    const value = { user, login, logout, checkCredentials, MOCK_USER };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
