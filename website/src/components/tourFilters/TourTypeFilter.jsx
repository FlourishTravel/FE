import { TOUR_TYPE_OPTIONS } from './tourFilterConfig';
import styles from './tourFilters.module.css';

export default function TourTypeFilter({ value, onChange }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Loại tour</h3>
      <div className={styles.radioList}>
        {TOUR_TYPE_OPTIONS.map((opt) => (
          <label key={opt.key} className={styles.radioLabel}>
            <input
              type="radio"
              name="tourType"
              checked={value === opt.key}
              onChange={() => onChange(value === opt.key ? null : opt.key)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
