import { Filter } from 'lucide-react';
import styles from './tourFilters.module.css';

export default function FilterFooter({ onReset, onApply }) {
  return (
    <div className={styles.footer}>
      <button type="button" className={styles.btnReset} onClick={onReset}>
        Đặt lại
      </button>
      <button type="button" className={styles.btnApply} onClick={onApply}>
        <Filter size={18} aria-hidden />
        Áp dụng bộ lọc
      </button>
    </div>
  );
}
