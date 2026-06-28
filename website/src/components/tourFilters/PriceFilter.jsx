import { PRICE_BOUNDS, PRICE_PRESETS } from './tourFilterConfig';
import { formatVnd } from './tourFilterUtils';
import styles from './tourFilters.module.css';

export default function PriceFilter({ priceMin, priceMax, pricePreset, onChange }) {
  const { min: boundMin, max: boundMax } = PRICE_BOUNDS;

  const setRange = (min, max, preset = null) => {
    onChange({ priceMin: min, priceMax: max, pricePreset: preset });
  };

  const handleMin = (v) => {
    const n = Math.min(Number(v), priceMax - PRICE_BOUNDS.step);
    setRange(Math.max(boundMin, n), priceMax, null);
  };

  const handleMax = (v) => {
    const n = Math.max(Number(v), priceMin + PRICE_BOUNDS.step);
    setRange(priceMin, Math.min(boundMax, n), null);
  };

  const fillLeft = ((priceMin - boundMin) / (boundMax - boundMin)) * 100;
  const fillWidth = ((priceMax - priceMin) / (boundMax - boundMin)) * 100;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Ngân sách (Giá tour)</h3>
      <div className={styles.priceDisplay}>
        <span>{formatVnd(priceMin)}</span>
        <span>{formatVnd(priceMax)}</span>
      </div>
      <div className={styles.rangeWrap}>
        <div className={styles.rangeTrack} />
        <div
          className={styles.rangeFill}
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        <input
          type="range"
          className={styles.rangeInput}
          min={boundMin}
          max={boundMax}
          step={PRICE_BOUNDS.step}
          value={priceMin}
          onChange={(e) => handleMin(e.target.value)}
          aria-label="Giá tối thiểu"
        />
        <input
          type="range"
          className={styles.rangeInput}
          min={boundMin}
          max={boundMax}
          step={PRICE_BOUNDS.step}
          value={priceMax}
          onChange={(e) => handleMax(e.target.value)}
          aria-label="Giá tối đa"
        />
      </div>
      <div className={styles.presetRow}>
        {PRICE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`${styles.presetBtn} ${pricePreset === p.key ? styles.presetBtnActive : ''}`}
            onClick={() => setRange(Math.max(boundMin, p.min), Math.min(boundMax, p.max), p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
