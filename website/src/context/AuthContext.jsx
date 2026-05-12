import React, { createContext, useContext, useState } from 'react';
import {
    loginApi,
    registerApi,
    logoutApi,
    saveAuthTokens,
    clearAuthTokens,
    getRefreshToken,
} from '../api/auth';

const STORAGE_KEY = 'flourish_user';

/**
 * Role mapping giữa Backend và Frontend.
 *  - Backend (RoleSeeder): ADMIN | TOUR_GUIDE | TRAVELER
 *  - Frontend (ProtectedRoute, UI):     admin | guide      | user
 */
const ROLE_MAP_BE_TO_FE = {
    ADMIN: 'admin',
    TOUR_GUIDE: 'guide',
    TRAVELER: 'user',
};

const normalizeRole = (role) => {
    if (!role) return 'user';
    return ROLE_MAP_BE_TO_FE[role] || role.toLowerCase();
};

// =========================
// MOCK fallback (chỉ dùng khi BE chưa chạy – tiện cho dev)
// =========================
export const MOCK_CREDENTIALS = { email: 'demo@flourish.com', password: 'flourish123' };
export const ADMIN_CREDENTIALS = { email: 'admin@flourish.com', password: 'admin123' };
export const GUIDE_CREDENTIALS = { email: 'guide@flourish.com', password: 'guide123' };

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

/** Chuẩn hoá user trả về từ BE để FE dùng đồng nhất. */
const mapBackendUser = (beUser) => {
    if (!beUser) return null;
    return {
        id: beUser.id,
        email: beUser.email,
        name: beUser.fullName || beUser.name || beUser.email,
        avatar: beUser.avatarUrl || beUser.avatar || null,
        role: normalizeRole(beUser.role),
        rawRole: beUser.role,
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [loading, setLoading] = useState(false);

    const persistUser = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    /** Đăng nhập qua API thật. Trả về user (đã map role) hoặc throw Error. */
    const loginWithApi = async (email, password) => {
        setLoading(true);
        try {
            const data = await loginApi(email.trim(), password);
            if (!data) throw new Error('Không nhận được dữ liệu đăng nhập');
            saveAuthTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            const mapped = mapBackendUser(data.user);
            persistUser(mapped);
            return mapped;
        } finally {
            setLoading(false);
        }
    };

    /** Đăng ký qua API thật. Sau khi đăng ký BE đã trả tokens nên tự động đăng nhập luôn. */
    const registerWithApi = async ({ email, password, fullName, phone }) => {
        setLoading(true);
        try {
            const data = await registerApi({ email: email.trim(), password, fullName, phone });
            if (!data) throw new Error('Không nhận được dữ liệu đăng ký');
            saveAuthTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            const mapped = mapBackendUser(data.user);
            persistUser(mapped);
            return mapped;
        } finally {
            setLoading(false);
        }
    };

    /** Đăng nhập bằng dữ liệu mock (legacy, vẫn giữ để Login.jsx fallback khi BE chưa chạy). */
    const login = (userData) => {
        persistUser(userData);
    };

    const logout = async () => {
        const refreshToken = getRefreshToken();
        await logoutApi(refreshToken);
        clearAuthTokens();
        persistUser(null);
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        persistUser(newUser);
    };

    // ===== Legacy mock helpers (giữ lại để Login.jsx tương thích ngược) =====
    const checkCredentials = (email, password) =>
        email.toLowerCase().trim() === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.password;

    const checkAdminCredentials = (email, password) =>
        email.toLowerCase().trim() === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password;

    const checkGuideCredentials = (email, password) =>
        email.toLowerCase().trim() === GUIDE_CREDENTIALS.email &&
        password === GUIDE_CREDENTIALS.password;

    const isAdmin = user?.role === 'admin';
    const isGuide = user?.role === 'guide';

    const value = {
        user,
        loading,
        login,
        loginWithApi,
        registerWithApi,
        logout,
        updateUser,
        checkCredentials,
        checkAdminCredentials,
        checkGuideCredentials,
        isAdmin,
        isGuide,
        MOCK_USER,
        MOCK_ADMIN,
        MOCK_GUIDE,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
