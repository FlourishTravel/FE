import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateTourModal.module.css';

const CreateTourModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        duration: '',
        basePrice: '',
        thumbnail: '',
        maxCapacity: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would make an API call here to create the tour
        // and receive the new tourId.
        const mockTourId = Math.floor(Math.random() * 10000);
        
        console.log("Tour created with data:", formData);
        
        // Close modal and redirect to Itinerary Builder
        onClose();
        navigate(`/admin/tours/itinerary/${mockTourId}`);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Khởi tạo Tour Mới</h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tên Tour</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                placeholder="VD: Khám phá Thái Lan 5N4Đ"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="destination">Điểm đến</label>
                                <input 
                                    type="text" 
                                    id="destination" 
                                    name="destination" 
                                    placeholder="VD: Bangkok, Pattaya"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="duration">Thời lượng</label>
                                <input 
                                    type="text" 
                                    id="duration" 
                                    name="duration" 
                                    placeholder="VD: 5 Ngày 4 Đêm"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="basePrice">Giá cơ bản (VNĐ)</label>
                                <input 
                                    type="number" 
                                    id="basePrice" 
                                    name="basePrice" 
                                    placeholder="VD: 6990000"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="maxCapacity">Số lượng người tối đa</label>
                                <input 
                                    type="number" 
                                    id="maxCapacity" 
                                    name="maxCapacity" 
                                    placeholder="VD: 25"
                                    value={formData.maxCapacity}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="thumbnail">URL Hình ảnh thu nhỏ</label>
                            <input 
                                type="url" 
                                id="thumbnail" 
                                name="thumbnail" 
                                placeholder="https://example.com/image.jpg"
                                value={formData.thumbnail}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mt-4 flex items-start gap-2">
                            <span className="material-icons-round text-blue-500">info</span>
                            <p>Bạn có thể bổ sung lịch trình chi tiết và hình ảnh sau khi khởi tạo tour thành công.</p>
                        </div>
                    </div>
                    
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            Tạo & Tiếp tục
                            <span className="material-icons-round">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTourModal;
