import React, { useEffect, useMemo, useState } from 'react';
import styles from './GuideAssignmentModal.module.css';
import { assignGuide, listAvailableGuides } from '../../../api/tourOperations';

/**
 * Modal phân công HDV cho 1 session tour (props session là TourOperationDto).
 *
 * Props:
 *  - isOpen: boolean
 *  - session: TourOperationDto | null
 *  - onClose(): đóng modal
 *  - onAssigned(updatedSession): callback khi gán thành công, nhận TourOperationDto mới
 */
const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
};

const WORKLOAD_LABEL = {
    light: { label: 'Nhẹ', cls: 'workloadLight' },
    balanced: { label: 'Cân bằng', cls: 'workloadBalanced' },
    heavy: { label: 'Bận', cls: 'workloadHeavy' },
};

const GuideAssignmentModal = ({ isOpen, session, onClose, onAssigned }) => {
    const [guides, setGuides] = useState([]);
    const [loadingGuides, setLoadingGuides] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchGuide, setSearchGuide] = useState('');
    const [selectedGuideId, setSelectedGuideId] = useState('');
    const [showBusy, setShowBusy] = useState(true);
    const [notify, setNotify] = useState(true);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !session) return;
        setErrorMsg('');
        setSelectedGuideId('');
        setNote('');
        setSearchGuide('');

        const fetchGuides = async () => {
            setLoadingGuides(true);
            try {
                const data = await listAvailableGuides({
                    date: session.startDate || undefined,
                    excludeSessionId: session.sessionId,
                });
                setGuides(data);
            } catch (err) {
                setErrorMsg(err?.message || 'Không tải được danh sách HDV.');
                setGuides([]);
            } finally {
                setLoadingGuides(false);
            }
        };
        fetchGuides();
    }, [isOpen, session]);

    const filteredGuides = useMemo(() => {
        const q = searchGuide.trim().toLowerCase();
        return guides.filter((g) => {
            if (!showBusy && g.busyOnTargetDate) return false;
            if (!q) return true;
            return (
                (g.fullName || '').toLowerCase().includes(q) ||
                (g.email || '').toLowerCase().includes(q) ||
                (g.phone || '').toLowerCase().includes(q)
            );
        });
    }, [guides, searchGuide, showBusy]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGuideId || !session) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const updated = await assignGuide(session.sessionId, {
                guideId: selectedGuideId,
                notify,
                note: note.trim() || undefined,
            });
            onAssigned?.(updated);
        } catch (err) {
            setErrorMsg(err?.message || 'Phân công thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !session) return null;

    const currentGuide = session.tourGuide;
    const needsReassign = currentGuide && !currentGuide.active;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Phân công HDV</h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.tourInfo}>
                            <div className={styles.tourName}>{session.tourTitle}</div>
                            <div className={styles.tourDate}>
                                <span className="material-icons-round" style={{ fontSize: 16 }}>event</span>
                                Khởi hành: {formatDate(session.startDate)}
                                {session.endDate && <> &nbsp;→ {formatDate(session.endDate)}</>}
                            </div>
                            <div className={styles.tourMeta}>
                                <span>Khách: {session.currentParticipants}/{session.maxParticipants}</span>
                                <span className={styles.divider}>•</span>
                                <span>Còn {session.remainingSlots} chỗ</span>
                            </div>
                        </div>

                        {currentGuide ? (
                            <div className={`${styles.currentGuide} ${needsReassign ? styles.currentGuideWarn : styles.currentGuideOk}`}>
                                <div className={styles.currentGuideIcon}>
                                    <span className="material-icons-round">
                                        {needsReassign ? 'error_outline' : 'check_circle'}
                                    </span>
                                </div>
                                <div className={styles.currentGuideText}>
                                    <p>
                                        HDV hiện tại: <strong>{currentGuide.fullName}</strong>
                                        {!currentGuide.active && <em> (đã bị tạm khoá)</em>}
                                    </p>
                                    <p className={styles.muted}>
                                        {currentGuide.email}
                                        {currentGuide.phone && ` • ${currentGuide.phone}`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={`${styles.currentGuide} ${styles.currentGuideWarn}`}>
                                <div className={styles.currentGuideIcon}>
                                    <span className="material-icons-round">person_off</span>
                                </div>
                                <div className={styles.currentGuideText}>
                                    <p><strong>Chưa có HDV phụ trách.</strong></p>
                                    <p className={styles.muted}>Cần điều phối ngay để gửi xác nhận cho khách.</p>
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Tìm HDV</label>
                            <div className={styles.searchRow}>
                                <input
                                    type="text"
                                    placeholder="Tên / email / SĐT..."
                                    className={styles.searchInput}
                                    value={searchGuide}
                                    onChange={(e) => setSearchGuide(e.target.value)}
                                />
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={showBusy}
                                        onChange={(e) => setShowBusy(e.target.checked)}
                                    />
                                    Hiện HDV bận
                                </label>
                            </div>
                        </div>

                        <div className={styles.guideList}>
                            {loadingGuides ? (
                                <div className={styles.muted}>Đang tải danh sách HDV...</div>
                            ) : filteredGuides.length === 0 ? (
                                <div className={styles.muted}>Không tìm thấy HDV phù hợp.</div>
                            ) : (
                                filteredGuides.map((g) => {
                                    const wl = WORKLOAD_LABEL[g.workloadLevel] || WORKLOAD_LABEL.balanced;
                                    return (
                                        <label
                                            key={g.id}
                                            className={`${styles.guideRow} ${selectedGuideId === g.id ? styles.guideRowSelected : ''} ${g.busyOnTargetDate ? styles.guideRowBusy : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="guide"
                                                value={g.id}
                                                checked={selectedGuideId === g.id}
                                                onChange={() => setSelectedGuideId(g.id)}
                                                disabled={g.busyOnTargetDate}
                                            />
                                            <div className={styles.guideAvatar}>
                                                {g.avatarUrl ? <img src={g.avatarUrl} alt={g.fullName} /> : g.initials}
                                            </div>
                                            <div className={styles.guideInfo}>
                                                <div className={styles.guideName}>{g.fullName}</div>
                                                <div className={styles.guideMeta}>
                                                    {g.email}{g.phone && ` • ${g.phone}`}
                                                </div>
                                            </div>
                                            <div className={styles.guideTags}>
                                                <span className={`${styles.workloadChip} ${styles[wl.cls]}`}>
                                                    {wl.label} ({g.assignedThisMonth}/tháng)
                                                </span>
                                                {g.busyOnTargetDate && (
                                                    <span className={styles.busyChip}>Trùng lịch</span>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Ghi chú nội bộ (tuỳ chọn)</label>
                            <textarea
                                className={styles.noteInput}
                                placeholder="Ví dụ: HDV cũ xin nghỉ phép, cần backup tuyến Bangkok..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <label className={styles.notifyToggle}>
                            <input
                                type="checkbox"
                                checked={notify}
                                onChange={(e) => setNotify(e.target.checked)}
                            />
                            <span className="material-icons-round" style={{ fontSize: 16, color: '#3b82f6' }}>
                                forward_to_inbox
                            </span>
                            Gửi email thông báo cho HDV được phân công
                        </label>

                        {errorMsg && (
                            <div className={styles.errorBanner}>
                                <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>
                                {errorMsg}
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={!selectedGuideId || submitting}
                        >
                            {submitting ? 'Đang lưu...' : 'Xác nhận phân công'}
                            <span className="material-icons-round" style={{ fontSize: 18 }}>send</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GuideAssignmentModal;
