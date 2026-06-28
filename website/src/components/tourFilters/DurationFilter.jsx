import { DURATION_OPTIONS } from './tourFilterConfig';
import styles from './tourFilters.module.css';

export default function DurationFilter({ selected, onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Thời gian tour</h3>
      <div className={styles.checkList}>
        {DURATION_OPTIONS.map((opt) => (
          <label key={opt.key} className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={selected.includes(opt.key)}
              onChange={() => toggle(opt.key)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
