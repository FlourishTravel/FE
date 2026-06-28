import React, { useRef, useState } from 'react';
import { uploadMedia } from '../../../api/upload';
import { resolveMediaUrl } from '../../../api/config';
import styles from './AdminImageField.module.css';

/**
 * Ô ảnh: có thể dán URL hoặc upload lên server (S3/local) — URL trả về ghi vào form/DB.
 *
 * @param {string} label
 * @param {string} value - URL hiện tại
 * @param {(url: string) => void} onChange
 * @param {string} [placeholder]
 * @param {string} [accept] - mặc định image/*
 */
const AdminImageField = ({
    label,
    value,
    onChange,
    placeholder = 'https://... hoặc tải ảnh lên',
    accept = 'image/*',
    uploadLabel = 'Tải ảnh',
}) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setErrorMsg('');
        setUploading(true);
        try {
            const url = await uploadMedia(file);
            if (url) onChange(url);
        } catch (err) {
            setErrorMsg(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    };

    const previewSrc = value ? resolveMediaUrl(value) : '';

    return (
        <div className={styles.wrap}>
            {label && <span className={styles.label}>{label}</span>}
            <div className={styles.row}>
                <input
                    type="text"
                    className={styles.input}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className={styles.hiddenFile}
                    onChange={handleFile}
                    aria-hidden
                />
                <button
                    type="button"
                    className={styles.fileBtn}
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                >
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>
                        {uploading ? 'hourglass_top' : 'cloud_upload'}
                    </span>
                    {uploading ? 'Đang tải...' : uploadLabel}
                </button>
            </div>
            <span className={styles.hint}>Upload lưu URL vào DB (S3 hoặc /uploads). Có thể chỉnh URL sau.</span>
            {errorMsg && <div className={styles.error}>{errorMsg}</div>}
            {previewSrc && (
                <div className={styles.preview}>
                    <img src={previewSrc} alt="" className={styles.previewImg} onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
                </div>
            )}
        </div>
    );
};

export default AdminImageField;
