import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'flourish_user';

// Data cứng: tài khoản mẫu để đăng nhập
export const MOCK_CREDENTIALS = {
    email: 'demo@flourish.com',
    password: 'flourish123',
};

// Admin credentials
export const ADMIN_CREDENTIALS = {
    email: 'admin@flourish.com',
    password: 'admin123',
};

// Guide credentials
export const GUIDE_CREDENTIALS = {
    email: 'guide@flourish.com',
    password: 'guide123',
};

export const MOCK_USER = {
    id: 1,
    email: MOCK_CREDENTIALS.email,
    name: 'Nguyễn Văn Demo',
    phone: '0901 234 567',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    gender: 'Nam',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    joinedDate: '01/2025',
    role: 'user',
};

export const MOCK_ADMIN = {
    id: 99,
    email: ADMIN_CREDENTIALS.email,
    name: 'Super Admin',
    phone: '0900 000 001',
    address: 'Flourish Travel HQ',
    gender: 'Nam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    joinedDate: '01/2024',
    role: 'admin',
};

export const MOCK_GUIDE = {
    id: 42,
    email: GUIDE_CREDENTIALS.email,
    name: 'HDV Trần Bình',
    phone: '0988 777 666',
    address: 'Flourish Guide Center',
    gender: 'Nam',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
    joinedDate: '03/2023',
    role: 'guide',
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

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    };

    const checkCredentials = (email, password) => {
        return (
            email.toLowerCase().trim() === MOCK_CREDENTIALS.email &&
            password === MOCK_CREDENTIALS.password
        );
    };

    const checkAdminCredentials = (email, password) => {
        return (
            email.toLowerCase().trim() === ADMIN_CREDENTIALS.email &&
            password === ADMIN_CREDENTIALS.password
        );
    };

    const checkGuideCredentials = (email, password) => {
        return (
            email.toLowerCase().trim() === GUIDE_CREDENTIALS.email &&
            password === GUIDE_CREDENTIALS.password
        );
    };

    const isAdmin = user?.role === 'admin';
    const isGuide = user?.role === 'guide';

    const value = { 
        user, login, logout, updateUser, 
        checkCredentials, checkAdminCredentials, checkGuideCredentials,
        isAdmin, isGuide, 
        MOCK_USER, MOCK_ADMIN, MOCK_GUIDE 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
