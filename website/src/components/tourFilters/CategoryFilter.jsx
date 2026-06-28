import styles from './tourFilters.module.css';

/**
 * @param {{ categories: Array<{ id: string, name: string }>, selected: string[], onChange: (ids: string[]) => void, loading?: boolean }} props
 */
export default function CategoryFilter({ categories = [], selected = [], onChange, loading = false }) {
  const toggle = (id) => {
    if (id === 'all') {
      onChange([]);
      return;
    }
    const idStr = String(id);
    if (selected.includes(idStr)) {
      onChange(selected.filter((k) => k !== idStr));
    } else {
      onChange([...selected, idStr]);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Danh mục</h3>
      {loading ? (
        <p className={styles.hintText}>Đang tải danh mục...</p>
      ) : (
        <div className={styles.chipGroup}>
          <button
            type="button"
            className={`${styles.chip} ${!selected.length ? styles.chipActive : ''}`}
            onClick={() => toggle('all')}
          >
            Tất cả
          </button>
          {categories.map((cat) => {
            const id = String(cat.id);
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                onClick={() => toggle(id)}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}
      {!loading && !categories.length ? (
        <p className={styles.hintText}>Chưa có danh mục tour.</p>
      ) : null}
    </div>
  );
}
