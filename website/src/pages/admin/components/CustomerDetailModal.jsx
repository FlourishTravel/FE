import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './CustomerDetailModal.module.css';
import {
    activateAdminCustomer,
    deactivateAdminCustomer,
    getAdminCustomerDetail,
} from '../../../api/adminCustomers';
import EditCustomerModal from './EditCustomerModal';

/**
 * Modal chi tiết khách hàng cho admin.
 *
 * Tabs:
 *  - Tổng quan (profile + thống kê + activity feed)
 *  - Bookings (lịch sử booking gần đây)
 *  - Yêu thích (tour KH đã thả tim)
 *  - Ghi chú (admin note)
 *
 * Props:
 *  - customerId: string | null  -> mở khi non-null
 *  - onClose(): đóng modal
 *  - onUpdated(detail): callback khi dữ liệu thay đổi (sync ra list page)
 */

const TIER_INFO = {
    VIP: { label: 'VIP', cls: 'tierVIP' },
    GOLD: { label: 'Gold', cls: 'tierGold' },
    SILVER: { label: 'Silver', cls: 'tierSilver' },
    STANDARD: { label: 'Standard', cls: 'tierStandard' },
};

const BOOKING_STATUS_INFO = {
    pending: { label: 'Chờ thanh toán', cls: 'bkPending' },
    paid: { label: 'Đã thanh toán', cls: 'bkPaid' },
    confirmed: { label: 'Đã xác nhận', cls: 'bkConfirmed' },
    completed: { label: 'Hoàn thành', cls: 'bkCompleted' },
    cancelled: { label: 'Đã huỷ', cls: 'bkCancelled' },
};

const ACTIVITY_DOT = {
    account_created: '#9ca3af',
    booking_created: '#3b82f6',
    booking_paid: '#10b981',
    booking_confirmed: '#0ea5e9',
    booking_completed: '#22c55e',
    booking_cancelled: '#ef4444',
    favorite_added: '#f59e0b',
};

const formatVnd = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (value) => {
    if (!value) return '—';
    try { return new Date(value).toLocaleDateString('vi-VN'); } catch { return '—'; }
};

const formatDateTime = (value) => {
    if (!value) return '—';
    try { return new Date(value).toLocaleString('vi-VN'); } catch { return '—'; }
};

const formatGender = (g) => {
    if (!g) return '—';
    const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return map[g] || g;
};

const initialsOf = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const CustomerDetailModal = ({ customerId, onClose, onUpdated }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [submitting, setSubmitting] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await getAdminCustomerDetail(customerId);
            setDetail(data);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải thông tin khách hàng');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (customerId) {
            setActiveTab('overview');
            setSuccessMsg('');
            fetchDetail();
        }
    }, [customerId, fetchDetail]);

    const tierInfo = useMemo(
        () => (detail ? TIER_INFO[detail.tier] || TIER_INFO.STANDARD : TIER_INFO.STANDARD),
        [detail]
    );

    const toggleActive = useCallback(async () => {
        if (!detail || submitting) return;
        const isActivating = !detail.active;
        const verb = isActivating ? 'kích hoạt' : 'vô hiệu hoá';
        if (!window.confirm(`Bạn chắc chắn muốn ${verb} khách hàng này?`)) return;

        setSubmitting(true);
        setErrorMsg('');
        try {
            const updated = isActivating
                ? await activateAdminCustomer(detail.id)
                : await deactivateAdminCustomer(detail.id);
            setDetail(updated);
            setSuccessMsg(`Đã ${verb} khách hàng`);
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err.message || `Không thể ${verb} khách hàng`);
        } finally {
            setSubmitting(false);
        }
    }, [detail, submitting, onUpdated]);

    const handleEdited = useCallback((updated) => {
        setDetail(updated);
        setSuccessMsg('Đã lưu thay đổi');
        onUpdated?.(updated);
    }, [onUpdated]);

    if (!customerId) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    {/* HEADER */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            {detail?.avatarUrl ? (
                                <img src={detail.avatarUrl} alt="" className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarFallback}>{initialsOf(detail?.fullName)}</div>
                            )}
                            <div>
                                <h2 className={styles.title}>{detail?.fullName || 'Đang tải...'}</h2>
                                <div className={styles.subRow}>
                                    <span className={styles.email}>{detail?.email || '—'}</span>
                                    {detail && (
                                        <span className={`${styles.tier} ${styles[tierInfo.cls]}`}>{tierInfo.label}</span>
                                    )}
                                    {detail && !detail.active && (
                                        <span className={styles.inactiveBadge}>Đã vô hiệu hoá</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>

                    {/* TABS */}
                    <div className={styles.tabs}>
                        {[
                            { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
                            { id: 'bookings', label: `Bookings (${detail?.bookingCount ?? 0})`, icon: 'event' },
                            { id: 'favorites', label: `Yêu thích (${detail?.favoriteTours?.length ?? 0})`, icon: 'favorite' },
                            { id: 'note', label: 'Ghi chú', icon: 'sticky_note_2' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* MESSAGES */}
                    {(errorMsg || successMsg) && (
                        <div className={styles.messages}>
                            {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}
                            {successMsg && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{successMsg}</div>}
                        </div>
                    )}

                    {/* BODY */}
                    <div className={styles.body}>
                        {loading && <div className={styles.loading}>Đang tải...</div>}
                        {!loading && !detail && <div className={styles.empty}>Không tìm thấy khách hàng</div>}

                        {!loading && detail && activeTab === 'overview' && (
                            <div className={styles.tabBody}>
                                <div className={styles.statsRow}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>Tổng chi tiêu</span>
                                        <span className={styles.statValue}>{formatVnd(detail.totalSpent)}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>Tổng booking</span>
                                        <span className={styles.statValue}>{detail.bookingCount}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>Hoàn thành</span>
                                        <span className={styles.statValue}>{detail.completedBookingCount}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>Chi tiêu TB</span>
                                        <span className={styles.statValue}>{formatVnd(detail.averageOrderValue)}</span>
                                    </div>
                                </div>

                                <div className={styles.gridTwo}>
                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>Thông tin liên hệ</h4>
                                        <div className={styles.infoGrid}>
                                            <InfoRow icon="mail" label="Email" value={detail.email} />
                                            <InfoRow icon="phone" label="SĐT" value={detail.phone || '—'} />
                                            <InfoRow
                                                icon="location_on"
                                                label="Địa chỉ"
                                                value={detail.address || '—'}
                                            />
                                            <InfoRow
                                                icon="flag"
                                                label="Quốc tịch"
                                                value={detail.nationality || 'Việt Nam'}
                                            />
                                        </div>
                                    </section>

                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>Hồ sơ cá nhân</h4>
                                        <div className={styles.infoGrid}>
                                            <InfoRow
                                                icon="cake"
                                                label="Ngày sinh"
                                                value={detail.dateOfBirth ? `${formatDate(detail.dateOfBirth)}${detail.age ? ` (${detail.age} tuổi)` : ''}` : '—'}
                                            />
                                            <InfoRow icon="wc" label="Giới tính" value={formatGender(detail.gender)} />
                                            <InfoRow
                                                icon="event_available"
                                                label="Tham gia"
                                                value={formatDateTime(detail.joinedAt)}
                                            />
                                            <InfoRow
                                                icon="schedule"
                                                label="Hoạt động cuối"
                                                value={formatDateTime(detail.lastActiveAt)}
                                            />
                                            <InfoRow
                                                icon="mark_email_read"
                                                label="Đăng ký nhận tin"
                                                value={detail.marketingOptIn ? 'Có' : 'Không'}
                                            />
                                            <InfoRow
                                                icon="workspace_premium"
                                                label="Thời gian thành viên"
                                                value={detail.membershipMonths != null ? `${detail.membershipMonths} tháng` : '—'}
                                            />
                                        </div>
                                    </section>
                                </div>

                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Hoạt động gần đây</h4>
                                    {(detail.activities?.length || 0) === 0 ? (
                                        <div className={styles.emptyMini}>Chưa có hoạt động</div>
                                    ) : (
                                        <ul className={styles.activityList}>
                                            {detail.activities.map((a, idx) => (
                                                <li key={idx} className={styles.activityItem}>
                                                    <span
                                                        className={styles.activityDot}
                                                        style={{ background: ACTIVITY_DOT[a.type] || '#6b7280' }}
                                                    />
                                                    <div className={styles.activityContent}>
                                                        <div className={styles.activityText}>{a.text}</div>
                                                        <div className={styles.activityTime}>{formatDateTime(a.at)}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            </div>
                        )}

                        {!loading && detail && activeTab === 'bookings' && (
                            <div className={styles.tabBody}>
                                {(detail.recentBookings?.length || 0) === 0 ? (
                                    <div className={styles.empty}>Khách hàng chưa có booking nào</div>
                                ) : (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Mã</th>
                                                <th>Tour</th>
                                                <th>Khởi hành</th>
                                                <th>Khách</th>
                                                <th>Tổng tiền</th>
                                                <th>Đã trả</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detail.recentBookings.map((b) => {
                                                const st = BOOKING_STATUS_INFO[(b.status || '').toLowerCase()] || { label: b.status, cls: '' };
                                                return (
                                                    <tr key={b.id}>
                                                        <td className={styles.codeCell}>{b.bookingCode}</td>
                                                        <td>{b.tourTitle || '—'}</td>
                                                        <td>{formatDate(b.startDate)}</td>
                                                        <td>{b.guestCount ?? '—'}</td>
                                                        <td className={styles.amountCell}>{formatVnd(b.totalAmount)}</td>
                                                        <td className={styles.amountCell}>{formatVnd(b.paidAmount)}</td>
                                                        <td>
                                                            <span className={`${styles.bkBadge} ${styles[st.cls] || ''}`}>{st.label}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {!loading && detail && activeTab === 'favorites' && (
                            <div className={styles.tabBody}>
                                {(detail.favoriteTours?.length || 0) === 0 ? (
                                    <div className={styles.empty}>Khách hàng chưa thả tim tour nào</div>
                                ) : (
                                    <div className={styles.favGrid}>
                                        {detail.favoriteTours.map((f) => (
                                            <div key={f.tourId} className={styles.favCard}>
                                                {f.thumbnailUrl ? (
                                                    <img src={f.thumbnailUrl} alt="" className={styles.favThumb} />
                                                ) : (
                                                    <div className={styles.favThumbFallback}>
                                                        <span className="material-icons-round">image</span>
                                                    </div>
                                                )}
                                                <div className={styles.favBody}>
                                                    <div className={styles.favTitle}>{f.tourTitle || 'Tour'}</div>
                                                    <div className={styles.favMeta}>Thêm: {formatDate(f.addedAt)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && detail && activeTab === 'note' && (
                            <div className={styles.tabBody}>
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Ghi chú nội bộ (chỉ admin xem)</h4>
                                    {detail.adminNote ? (
                                        <pre className={styles.noteBox}>{detail.adminNote}</pre>
                                    ) : (
                                        <div className={styles.emptyMini}>Chưa có ghi chú nào. Bạn có thể chỉnh sửa để bổ sung.</div>
                                    )}
                                </section>
                                {detail.pendingRefundAmount && Number(detail.pendingRefundAmount) > 0 && (
                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>Cảnh báo</h4>
                                        <div className={styles.warningBox}>
                                            <span className="material-icons-round" style={{ fontSize: '18px' }}>warning</span>
                                            Có yêu cầu hoàn tiền đang chờ xử lý:&nbsp;
                                            <strong>{formatVnd(detail.pendingRefundAmount)}</strong>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    {detail && (
                        <div className={styles.footer}>
                            <button
                                className={`${styles.btn} ${styles.btnDanger}`}
                                onClick={toggleActive}
                                disabled={submitting}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>
                                    {detail.active ? 'block' : 'check_circle'}
                                </span>
                                {detail.active ? 'Vô hiệu hoá' : 'Kích hoạt'}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setShowEdit(true)}
                                disabled={submitting}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>edit</span>
                                Chỉnh sửa
                            </button>
                            <a
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                href={`mailto:${detail.email}`}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>mail</span>
                                Gửi Email
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {showEdit && detail && (
                <EditCustomerModal
                    customer={detail}
                    onClose={() => setShowEdit(false)}
                    onSaved={(updated) => {
                        setShowEdit(false);
                        handleEdited(updated);
                    }}
                />
            )}
        </>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className={styles.infoRow}>
        <span className="material-icons-round" style={{ fontSize: '16px', color: '#9ca3af' }}>{icon}</span>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
    </div>
);

export default CustomerDetailModal;
