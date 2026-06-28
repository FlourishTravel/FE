import styles from './tourFilters.module.css';

export default function ActiveFilterChips({ chips, onClearAll }) {
  if (!chips?.length) return null;

  return (
    <div className={styles.chipsBar} role="list" aria-label="Bộ lọc đang áp dụng">
      {chips.map((chip) => (
        <span key={chip.id} className={styles.activeChip} role="listitem">
          {chip.label}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={chip.remove}
            aria-label={`Xóa bộ lọc ${chip.label}`}
          >
            ✕
          </button>
        </span>
      ))}
      <button type="button" className={styles.clearAll} onClick={onClearAll}>
        Xóa tất cả
      </button>
    </div>
  );
}
