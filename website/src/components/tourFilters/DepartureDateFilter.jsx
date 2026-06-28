import { DEPARTURE_PRESETS } from './tourFilterConfig';
import { resolveDeparturePresetDate } from './tourFilterUtils';
import styles from './tourFilters.module.css';

export default function DepartureDateFilter({ departureDate, departurePreset, onChange }) {
  const selectPreset = (key) => {
    if (key === 'custom') {
      onChange({ departurePreset: 'custom', departureDate: departureDate || '' });
      return;
    }
    onChange({
      departurePreset: key,
      departureDate: resolveDeparturePresetDate(key),
    });
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Ngày khởi hành</h3>
      <div className={styles.presetRow}>
        {DEPARTURE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`${styles.presetBtn} ${departurePreset === p.key ? styles.presetBtnActive : ''}`}
            onClick={() => selectPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {(departurePreset === 'custom' || departureDate) && (
        <input
          type="date"
          className={styles.dateInput}
          value={departureDate || ''}
          onChange={(e) =>
            onChange({ departureDate: e.target.value, departurePreset: 'custom' })
          }
        />
      )}
    </div>
  );
}
