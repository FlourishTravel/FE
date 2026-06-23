import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTravelPreferences, updateTravelPreferences } from '../../api/users';
import { getAccessToken } from '../../api/auth';

const PrivacySettings = () => {
    const [prefs, setPrefs] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!getAccessToken()) return;
        getTravelPreferences()
            .then(res => { if (res.success) setPrefs(res.data); })
            .catch(() => {});
    }, []);

    const toggle = (key) => {
        setPrefs(p => ({ ...p, [key]: !p?.[key] }));
    };

    const handleSave = async () => {
        if (!prefs) return;
        setSaving(true);
        setMessage('');
        try {
            await updateTravelPreferences({
                notificationConsent: prefs.notificationConsent,
                locationConsent: prefs.locationConsent,
                personalizationConsent: prefs.personalizationConsent,
                travelStyles: prefs.travelStyles,
                budgetLevel: prefs.budgetLevel,
                favoriteFoods: prefs.favoriteFoods,
                foodDislikes: prefs.foodDislikes,
                foodAllergies: prefs.foodAllergies,
            });
            setMessage('Đã lưu cài đặt Flora AI.');
        } catch (e) {
            setMessage(e.message || 'Lỗi lưu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="text-primary-500 hover:underline mb-8 inline-block">
                    ← Quay lại trang chủ
                </Link>
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Cài đặt Flora AI</h1>
                <p className="text-gray-600 mb-8">
                    Flora AI – Người bạn đồng hành thông minh cho mọi chuyến đi.
                </p>
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {!getAccessToken() ? (
                        <p className="text-gray-600">
                            <Link to="/login" className="text-emerald-600 underline">Đăng nhập</Link> để cấu hình sở thích và quyền riêng tư Flora.
                        </p>
                    ) : prefs ? (
                        <>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={!!prefs.personalizationConsent} onChange={() => toggle('personalizationConsent')} />
                                <span>Cá nhân hóa gợi ý theo sở thích và lịch sử tour</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={!!prefs.notificationConsent} onChange={() => toggle('notificationConsent')} />
                                <span>Nhận nhắc lịch tập trung / lên xe từ Flora</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={!!prefs.locationConsent} onChange={() => toggle('locationConsent')} />
                                <span>Cho phép Flora dùng vị trí GPS trong chuyến đi (gợi ý gần, nhắc quay lại xe)</span>
                            </label>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách (low / medium / high)</label>
                                <input
                                    className="border rounded px-3 py-2 w-full max-w-xs"
                                    value={prefs.budgetLevel || ''}
                                    onChange={e => setPrefs(p => ({ ...p, budgetLevel: e.target.value }))}
                                    placeholder="medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dị ứng / không ăn (cách nhau bởi dấu phẩy)</label>
                                <input
                                    className="border rounded px-3 py-2 w-full"
                                    value={(prefs.foodAllergies || []).join(', ')}
                                    onChange={e => setPrefs(p => ({
                                        ...p,
                                        foodAllergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                    }))}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                            </button>
                            {message && <p className="text-sm text-emerald-700">{message}</p>}
                        </>
                    ) : (
                        <p className="text-gray-500">Đang tải...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
