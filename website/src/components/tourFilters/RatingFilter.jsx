import { RATING_OPTIONS } from './tourFilterConfig';
import styles from './tourFilters.module.css';

function StarRow({ count, half = false }) {
  const full = '★'.repeat(count);
  const empty = '☆'.repeat(5 - count - (half ? 1 : 0));
  return (
    <span className={styles.stars}>
      {full}
      {half ? '☆' : ''}
      {empty}
    </span>
  );
}

export default function RatingFilter({ value, onChange }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Đánh giá</h3>
      <div className={styles.ratingList}>
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`${styles.ratingOption} ${value === opt.min ? styles.ratingOptionActive : ''}`}
            onClick={() => onChange(value === opt.min ? null : opt.min)}
          >
            <StarRow count={Math.floor(opt.min)} half={opt.min % 1 !== 0} />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
