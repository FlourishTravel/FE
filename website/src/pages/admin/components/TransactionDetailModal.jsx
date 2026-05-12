import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './TransactionDetailModal.module.css';
import { getTransactionDetail, updatePayment } from '../../../api/adminFinance';

/**
 * Modal chi tiết 1 giao dịch (payment hoặc refund).
 *
 * Props:
 *   - kind:    "payment" | "refund"
 *   - id:      transaction id (UUID) — non-null để mở
 *   - onClose(): đóng modal
 *   - onUpdated(detail): khi payment được update (sync list)
 */

const STATUS_INFO = {
    pending:   { label: 'Đang xử lý',  cls: 'stPending' },
    paid:      { label: 'Thành công',  cls: 'stPaid' },
    failed:    { label: 'Thất bại',    cls: 'stFailed' },
    refunded:  { label: 'Đã hoàn',     cls: 'stRefunded' },
    processed: { label: 'Đã hoàn',     cls: 'stPaid' },
    rejected:  { label: 'Từ chối',     cls: 'stFailed' },
};

const PROVIDER_LABEL = {
    momo: 'MoMo',
    vnpay: 'VNPay',
    bank_transfer: 'Chuyển khoản NH',
    manual: 'Ghi nhận thủ công',
    credit_card: 'Thẻ tín dụng',
};

const formatVnd = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
};

const formatDateTime = (v) => {
    if (!v) return '—';
    try { return new Date(v).toLocaleString('vi-VN'); } catch { return '—'; }
};

const formatDate = (v) => {
    if (!v) return '—';
    try { return new Date(v).toLocaleDateString('vi-VN'); } catch { return '—'; }
};

const TransactionDetailModal = ({ kind, id, onClose, onUpdated }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [editStatus, setEditStatus] = useState('');
    const [editFee, setEditFee] = useState('');
    const [editFailureReason, setEditFailureReason] = useState('');
    const [editNote, setEditNote] = useState('');

    const fetchDetail = useCallback(async () => {
        if (!id || !kind) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await getTransactionDetail(kind, id);
            setDetail(data);
            setEditStatus(data?.status || '');
            setEditFee(data?.feeAmount != null ? String(data.feeAmount) : '');
            setEditFailureReason(data?.failureReason || '');
            setEditNote(data?.adminNote || '');
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải thông tin giao dịch');
        } finally {
            setLoading(false);
        }
    }, [id, kind]);

    useEffect(() => {
        if (id && kind) {
            setSuccessMsg('');
            fetchDetail();
        }
    }, [id, kind, fetchDetail]);

    const statusInfo = useMemo(() => {
        if (!detail) return null;
        const k = (detail.status || '').toLowerCase();
        return STATUS_INFO[k] || { label: detail.status || '—', cls: 'stPending' };
    }, [detail]);

    const isPayment = detail?.kind === 'payment';

    const handleSavePayment = useCallback(async (e) => {
        e?.preventDefault?.();
        if (!detail || !isPayment) return;
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                status: editStatus || undefined,
                feeAmount: editFee === '' ? null : Number(editFee),
                failureReason: editFailureReason || null,
                adminNote: editNote || null,
            };
            const updated = await updatePayment(detail.id, payload);
            setDetail(updated);
            setSuccessMsg('Đã lưu thay đổi');
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể lưu thay đổi');
        } finally {
            setSubmitting(false);
        }
    }, [detail, isPayment, editStatus, editFee, editFailureReason, editNote, onUpdated]);

    if (!id) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={`${styles.iconBox} ${isPayment ? styles.iconPayment : styles.iconRefund}`}>
                            <span className="material-icons-round" style={{ fontSize: '22px' }}>
                                {isPayment ? 'payments' : 'currency_exchange'}
                            </span>
                        </div>
                        <div>
                            <h2 className={styles.title}>{isPayment ? 'Chi tiết thanh toán' : 'Chi tiết hoàn tiền'}</h2>
                            <div className={styles.subRow}>
                                <span className={styles.code}>{detail?.code || '—'}</span>
                                {statusInfo && (
                                    <span className={`${styles.status} ${styles[statusInfo.cls]}`}>{statusInfo.label}</span>
                                )}
                                {detail?.typeLabel && <span className={styles.typeBadge}>{detail.typeLabel}</span>}
                            </div>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Messages */}
                {(errorMsg || successMsg) && (
                    <div className={styles.messages}>
                        {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}
                        {successMsg && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{successMsg}</div>}
                    </div>
                )}

                {/* BODY */}
                <div className={styles.body}>
                    {loading && <div className={styles.loading}>Đang tải...</div>}
                    {!loading && !detail && <div className={styles.empty}>Không tìm thấy giao dịch</div>}

                    {!loading && detail && (
                        <>
                            {/* Pricing summary */}
                            <div className={styles.pricingCard}>
                                <div className={styles.pricingRow}>
                                    <span className={styles.pLabel}>Số tiền</span>
                                    <span className={styles.pValue}>{formatVnd(detail.amount)}</span>
                                </div>
                                {isPayment && (
                                    <>
                                        <div className={styles.pricingRow}>
                                            <span className={styles.pLabel}>Phí cổng</span>
                                            <span className={styles.pValueSmall}>− {formatVnd(detail.feeAmount)}</span>
                                        </div>
                                        <div className={`${styles.pricingRow} ${styles.pricingRowTotal}`}>
                                            <span className={styles.pLabel}>Thực thu</span>
                                            <span className={styles.pValueTotal}>{formatVnd(detail.netAmount)}</span>
                                        </div>
                                    </>
                                )}
                                {!isPayment && (
                                    <div className={`${styles.pricingRow} ${styles.pricingRowTotal}`}>
                                        <span className={styles.pLabel}>Khoản hoàn</span>
                                        <span className={`${styles.pValueTotal} ${styles.refundValue}`}>−{formatVnd(detail.amount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Booking context */}
                            {detail.booking && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Booking</h4>
                                    <div className={styles.bookingGrid}>
                                        <InfoCell icon="confirmation_number" label="Mã booking" value={detail.booking.code} />
                                        <InfoCell icon="airplane_ticket" label="Tour" value={detail.booking.tourTitle || '—'} />
                                        <InfoCell icon="event" label="Khởi hành" value={formatDate(detail.booking.departureDate)} />
                                        <InfoCell icon="groups" label="Số khách" value={detail.booking.guestCount ?? '—'} />
                                        <InfoCell icon="payments" label="Tổng tiền" value={formatVnd(detail.booking.totalAmount)} />
                                        <InfoCell icon="discount" label="Giảm giá" value={detail.booking.discountAmount ? `−${formatVnd(detail.booking.discountAmount)}` : '—'} />
                                    </div>
                                </section>
                            )}

                            {/* Customer */}
                            {detail.booking && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Khách hàng</h4>
                                    <div className={styles.infoGrid}>
                                        <InfoRow icon="person" label="Họ tên" value={detail.booking.customerName || '—'} />
                                        <InfoRow icon="mail" label="Email" value={detail.booking.customerEmail || '—'} />
                                        <InfoRow icon="phone" label="SĐT" value={detail.booking.customerPhone || '—'} />
                                    </div>
                                </section>
                            )}

                            {/* Gateway info (payment only) */}
                            {isPayment && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Thông tin cổng thanh toán</h4>
                                    <div className={styles.infoGrid}>
                                        <InfoRow icon="bolt" label="Cổng" value={PROVIDER_LABEL[detail.provider] || detail.provider || '—'} />
                                        <InfoRow icon="receipt" label="Order ID" value={detail.orderId || '—'} />
                                        <InfoRow icon="tag" label="Request ID" value={detail.requestId || '—'} />
                                        <InfoRow icon="vpn_key" label="Mã GD cổng" value={detail.providerTransId || '—'} />
                                        <InfoRow icon="business" label="Partner code" value={detail.partnerCode || '—'} />
                                        <InfoRow icon="event_available" label="Ngày thanh toán" value={formatDateTime(detail.paidAt)} />
                                    </div>
                                </section>
                            )}

                            {/* Refund info */}
                            {!isPayment && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Thông tin hoàn tiền</h4>
                                    <div className={styles.infoGrid}>
                                        <InfoRow icon="event" label="Ngày yêu cầu" value={formatDateTime(detail.createdAt)} />
                                        <InfoRow icon="event_available" label="Ngày xử lý" value={formatDateTime(detail.processedAt)} />
                                        <InfoRow icon="person_check" label="Xử lý bởi" value={detail.processedByName || '—'} />
                                        <InfoRow icon="vpn_key" label="Mã hoàn cổng" value={detail.providerTransId || '—'} />
                                    </div>
                                    {detail.reason && (
                                        <div className={styles.notice}>
                                            <span className={styles.noticeLabel}>Lý do KH yêu cầu:</span>
                                            <p className={styles.noticeBody}>{detail.reason}</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Failure reason */}
                            {isPayment && detail.failureReason && (
                                <section className={`${styles.section} ${styles.failureSection}`}>
                                    <h4 className={styles.sectionTitle}>Lý do thất bại</h4>
                                    <p className={styles.noticeBody}>{detail.failureReason}</p>
                                </section>
                            )}

                            {/* Related transactions */}
                            {((detail.relatedPayments?.length || 0) > 1 || (detail.relatedRefunds?.length || 0) > 0) && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Lịch sử giao dịch của booking</h4>
                                    <table className={styles.relTable}>
                                        <thead>
                                            <tr>
                                                <th>Mã</th>
                                                <th>Loại</th>
                                                <th>Cổng</th>
                                                <th className={styles.amountCol}>Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(detail.relatedPayments || []).map((p) => {
                                                const st = STATUS_INFO[(p.status || '').toLowerCase()] || { label: p.status, cls: 'stPending' };
                                                return (
                                                    <tr key={`p-${p.id}`} className={p.id === detail.id ? styles.relCurrent : ''}>
                                                        <td className={styles.codeCell}>{p.code}</td>
                                                        <td>Thanh toán</td>
                                                        <td>{PROVIDER_LABEL[p.provider] || p.provider || '—'}</td>
                                                        <td className={styles.amountCol}>{formatVnd(p.amount)}</td>
                                                        <td><span className={`${styles.status} ${styles[st.cls]}`}>{st.label}</span></td>
                                                        <td>{formatDateTime(p.paidAt || p.createdAt)}</td>
                                                    </tr>
                                                );
                                            })}
                                            {(detail.relatedRefunds || []).map((r) => {
                                                const st = STATUS_INFO[(r.status || '').toLowerCase()] || { label: r.status, cls: 'stPending' };
                                                return (
                                                    <tr key={`r-${r.id}`} className={r.id === detail.id ? styles.relCurrent : ''}>
                                                        <td className={styles.codeCell}>{r.code}</td>
                                                        <td>Hoàn tiền</td>
                                                        <td>—</td>
                                                        <td className={`${styles.amountCol} ${styles.refundValue}`}>−{formatVnd(r.amount)}</td>
                                                        <td><span className={`${styles.status} ${styles[st.cls]}`}>{st.label}</span></td>
                                                        <td>{formatDateTime(r.processedAt || r.createdAt)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </section>
                            )}

                            {/* Admin form */}
                            {isPayment && (
                                <form className={styles.adminForm} onSubmit={handleSavePayment}>
                                    <h4 className={styles.sectionTitle}>Hành động của admin</h4>
                                    <div className={styles.formGrid}>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Trạng thái</label>
                                            <select
                                                className={styles.input}
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                            >
                                                <option value="pending">Đang xử lý</option>
                                                <option value="paid">Thành công</option>
                                                <option value="failed">Thất bại</option>
                                                <option value="refunded">Đã hoàn</option>
                                            </select>
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Phí cổng (VND)</label>
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                className={styles.input}
                                                value={editFee}
                                                onChange={(e) => setEditFee(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    {editStatus === 'failed' && (
                                        <div className={styles.field}>
                                            <label className={styles.label}>Lý do thất bại <span className={styles.required}>*</span></label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={editFailureReason}
                                                onChange={(e) => setEditFailureReason(e.target.value)}
                                                placeholder="VD: KH huỷ giao dịch trên cổng MoMo"
                                            />
                                        </div>
                                    )}
                                    <div className={styles.field}>
                                        <label className={styles.label}>Ghi chú nội bộ</label>
                                        <textarea
                                            className={styles.textarea}
                                            rows="2"
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                            placeholder="VD: KH gọi yêu cầu xác nhận chuyển khoản ngày 12/05"
                                        />
                                    </div>
                                    <div className={styles.formActions}>
                                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitting}>
                                            <span className="material-icons-round" style={{ fontSize: '16px' }}>save</span>
                                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Admin note (refund) */}
                            {!isPayment && detail.adminNote && (
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Ghi chú admin</h4>
                                    <p className={styles.noticeBody}>{detail.adminNote}</p>
                                </section>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

const InfoCell = ({ icon, label, value }) => (
    <div className={styles.infoCell}>
        <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>{icon}</span>
        <div>
            <div className={styles.infoCellLabel}>{label}</div>
            <div className={styles.infoCellValue}>{value}</div>
        </div>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className={styles.infoRow}>
        <span className="material-icons-round" style={{ fontSize: '16px', color: '#9ca3af' }}>{icon}</span>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
    </div>
);

export default TransactionDetailModal;
