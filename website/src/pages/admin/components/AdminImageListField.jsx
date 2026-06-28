import React from 'react';
import AdminImageField from './AdminImageField';
import styles from './AdminImageListField.module.css';

/**
 * Gallery nhiều ảnh — ảnh đầu tiên dùng làm thumbnail tour.
 */
const AdminImageListField = ({
    label = 'Ảnh tour',
    urls = [],
    onChange,
    maxItems = 12,
}) => {
    const list = Array.isArray(urls) ? urls : [];

    const updateAt = (index, value) => {
        const next = [...list];
        next[index] = value;
        onChange(next);
    };

    const removeAt = (index) => {
        onChange(list.filter((_, i) => i !== index));
    };

    const addRow = () => {
        if (list.length >= maxItems) return;
        onChange([...list, '']);
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
                    <span className="material-icons-round" style={{ fontSize: 18 }}>add_photo_alternate</span>
                    Thêm ảnh
                </button>
            </div>
            <p className={styles.hint}>Ảnh đầu tiên là ảnh đại diện trên danh sách tour. Tối đa {maxItems} ảnh.</p>

            {list.length === 0 && (
                <button type="button" className={styles.emptyAdd} onClick={addRow}>
                    <span className="material-icons-round">add</span>
                    Thêm ảnh đầu tiên
                </button>
            )}

            {list.map((url, index) => (
                <div key={`img-${index}`} className={styles.row}>
                    <span className={styles.badge}>
                        {index === 0 ? 'Thumbnail' : `#${index + 1}`}
                    </span>
                    <div className={styles.field}>
                        <AdminImageField
                            label=""
                            value={url}
                            onChange={(v) => updateAt(index, v)}
                            placeholder="URL hoặc tải ảnh lên"
                        />
                    </div>
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeAt(index)}
                        title="Xóa ảnh"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AdminImageListField;
