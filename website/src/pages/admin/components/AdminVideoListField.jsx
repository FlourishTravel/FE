import React from 'react';
import AdminImageField from './AdminImageField';
import styles from './AdminVideoListField.module.css';

const EMPTY_VIDEO = { videoUrl: '', title: '', thumbnailUrl: '', durationSeconds: '' };

const AdminVideoListField = ({
    label = 'Video tour',
    videos = [],
    onChange,
    maxItems = 5,
}) => {
    const list = Array.isArray(videos) ? videos : [];

    const updateAt = (index, patch) => {
        const next = list.map((v, i) => (i === index ? { ...v, ...patch } : v));
        onChange(next);
    };

    const removeAt = (index) => {
        onChange(list.filter((_, i) => i !== index));
    };

    const addRow = () => {
        if (list.length >= maxItems) return;
        onChange([...list, { ...EMPTY_VIDEO }]);
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.header}>
                <span className={styles.label}>{label}</span>
                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={addRow}
                    disabled={list.length >= maxItems}
                >
                    <span className="material-icons-round" style={{ fontSize: 18 }}>videocam</span>
                    Thêm video
                </button>
            </div>
            <p className={styles.hint}>
                Dán link YouTube/Vimeo hoặc tải file video. Có thể thêm thumbnail (ảnh) cho video.
            </p>

            {list.length === 0 && (
                <button type="button" className={styles.emptyAdd} onClick={addRow}>
                    <span className="material-icons-round">add</span>
                    Thêm video giới thiệu
                </button>
            )}

            {list.map((v, index) => (
                <div key={`vid-${index}`} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.badge}>Video #{index + 1}</span>
                        <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeAt(index)}
                            title="Xóa video"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                    <AdminImageField
                        label="URL video hoặc tải lên"
                        value={v.videoUrl || ''}
                        onChange={(url) => updateAt(index, { videoUrl: url })}
                        accept="video/*"
                        uploadLabel="Tải video"
                        placeholder="https://youtube.com/... hoặc tải video"
                    />
                    <div className={styles.formRow}>
                        <label className={styles.smallLabel}>
                            Tiêu đề
                            <input
                                type="text"
                                className={styles.input}
                                value={v.title || ''}
                                onChange={(e) => updateAt(index, { title: e.target.value })}
                                placeholder="VD: Trải nghiệm 5N4Đ"
                            />
                        </label>
                        <label className={styles.smallLabel}>
                            Thời lượng (giây)
                            <input
                                type="number"
                                className={styles.input}
                                value={v.durationSeconds ?? ''}
                                onChange={(e) => updateAt(index, { durationSeconds: e.target.value })}
                                min="0"
                                placeholder="120"
                            />
                        </label>
                    </div>
                    <AdminImageField
                        label="Thumbnail video (tuỳ chọn)"
                        value={v.thumbnailUrl || ''}
                        onChange={(url) => updateAt(index, { thumbnailUrl: url })}
                        placeholder="Ảnh bìa video"
                    />
                </div>
            ))}
        </div>
    );
};

export default AdminVideoListField;
