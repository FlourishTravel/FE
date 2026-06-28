import { SORT_OPTIONS } from './tourFilterConfig';
import styles from './tourFilters.module.css';

export default function SortFilter({ value, onChange }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Sắp xếp</h3>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sắp xếp tour"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
