import React, { useState } from 'react';
import styles from './GuideAssignmentModal.module.css';

const AVAILABLE_GUIDES = [
    { id: 'EMP-007', name: 'Nguyễn Văn Hùng (Chuyên tuyến Đồng Nai)' },
    { id: 'EMP-008', name: 'Trần Đại Quang (Sẵn sàng)' },
    { id: 'EMP-012', name: 'Lê Minh Tâm (Dự bị)' },
];

const GuideAssignmentModal = ({ isOpen, onClose, tour, onAssign }) => {
    const [selectedGuide, setSelectedGuide] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen || !tour) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedGuide) return;
        
        // Show success alert
        setShowSuccess(true);
        
        // Callback to parent to update state
        onAssign(tour.id, selectedGuide);
        
        // Close modal after 3 seconds (animation time)
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 3000);
    };

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>Điều phối HDV</h2>
                        <button className={styles.closeBtn} onClick={onClose} title="Đóng">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className={styles.modalBody}>
                            <div className={styles.tourInfo}>
                                <div className={styles.tourName}>{tour.name}</div>
                                <div className={styles.tourDate}>
                                    <span className="material-icons-round" style={{ fontSize: '16px' }}>event</span>
                                    Ngày khởi hành: {tour.date}
                                </div>
                            </div>
                            
                            <div className={styles.currentGuide}>
                                <div className={styles.currentGuideIcon}>
                                    <span className="material-icons-round">error_outline</span>
                                </div>
                                <div className={styles.currentGuideText}>
                                    <p>HDV <strong>{tour.currentGuide}</strong> không thể tham gia.</p>
                                    <p>Hệ thống yêu cầu điều phối người thay thế.</p>
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="guideSelect">Chọn HDV Thay Thế</label>
                                <select 
                                    id="guideSelect" 
                                    className={styles.guideSelect}
                                    value={selectedGuide}
                                    onChange={(e) => setSelectedGuide(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Chọn Hướng dẫn viên --</option>
                                    {AVAILABLE_GUIDES.map(g => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.emailNote}>
                                <span className="material-icons-round" style={{ fontSize: '16px', color: '#3b82f6' }}>forward_to_inbox</span>
                                <span>Hệ thống sẽ tự động gửi Email thông báo cập nhật lịch trình cho cả HDV cũ và mới.</span>
                            </div>
                        </div>
                        
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>
                                Hủy
                            </button>
                            <button type="submit" className={styles.submitBtn} disabled={!selectedGuide}>
                                Cập nhật & Gửi Email
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showSuccess && (
                <div className={styles.alertSuccess}>
                    <span className="material-icons-round">check_circle</span>
                    <div>
                        <div style={{ fontWeight: 600 }}>Thành công!</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Đã gửi Email phân công cho HDV mới.</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuideAssignmentModal;
