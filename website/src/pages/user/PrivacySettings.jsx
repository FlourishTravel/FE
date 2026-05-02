import React from 'react';
import { Link } from 'react-router-dom';

const PrivacySettings = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="text-primary-500 hover:underline mb-8 inline-block">
                    ← Quay lại trang chủ
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Cài đặt về quyền riêng tư</h1>
                <div className="bg-white rounded-lg shadow-md p-8">
                    <p className="text-gray-600">
                        Nội dung cài đặt quyền riêng tư sẽ được thêm vào đây.
                    </p>
                    {/* Bạn có thể thêm nội dung chi tiết ở đây */}
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
