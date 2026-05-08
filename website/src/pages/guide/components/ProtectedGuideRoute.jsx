import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedGuideRoute = ({ children }) => {
    const { user, isGuide } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isGuide) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedGuideRoute;
