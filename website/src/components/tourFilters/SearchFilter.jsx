import { Search } from 'lucide-react';
import styles from './tourFilters.module.css';

export default function SearchFilter({ value, onChange }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Tìm theo tên / điểm đến</h3>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden>
          <Search size={18} />
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Ví dụ: Đà Nẵng, Bali, Nhật Bản..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
