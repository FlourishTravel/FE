import { ChevronDown } from 'lucide-react';
import styles from './tourFilters.module.css';

/**
 * Dropdown danh mục nhanh trên header danh sách tour.
 * @param {{ categories: Array<{ id: string, name: string }>, value: string | null, onChange: (id: string | null) => void, loading?: boolean, multipleSelected?: boolean }} props
 */
export default function CategoryDropdown({
  categories = [],
  value,
  onChange,
  loading = false,
  multipleSelected = false,
}) {
  return (
    <div className={styles.categoryDropdownWrap}>
      <span className={styles.categoryDropdownLabel}>Danh mục:</span>
      <div className={styles.categoryDropdownField}>
        <select
          className={styles.categoryDropdownSelect}
          value={multipleSelected ? '' : value || ''}
          disabled={loading}
          onChange={(e) => onChange(e.target.value || null)}
          aria-label="Lọc theo danh mục tour"
        >
          <option value="">
            {multipleSelected ? 'Nhiều danh mục (sidebar)' : 'Tất cả danh mục'}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.categoryDropdownIcon} aria-hidden />
      </div>
    </div>
  );
}
