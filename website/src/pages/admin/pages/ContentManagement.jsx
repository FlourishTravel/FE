import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminContent,
  deleteAdminContent,
  listAdminContents,
  updateAdminContent,
} from '../../../api/adminContent';
import styles from './PromotionManagement.module.css';

const CONTENT_TABS = [
  { key: 'news', label: 'Tin tức', href: '/news', hint: 'Hiện ở Khám phá → Blog du lịch (/news)' },
  { key: 'story', label: 'Câu chuyện', href: '/stories', hint: 'Hiện ở Khám phá → Gợi ý theo mùa (/stories)' },
  { key: 'career', label: 'Tuyển dụng', href: '/careers', hint: 'Hiện ở trang Tuyển dụng (/careers)' },
  { key: 'help', label: 'Trợ giúp', href: '/help', hint: 'Hiện ở trang Trợ giúp (/help)' },
  { key: 'guide', label: 'Cẩm nang', href: '/travel-guide', hint: 'Hiện ở Khám phá → Cẩm nang du lịch (/travel-guide)' },
];

const EMPTY_FORM = { title: '', slug: '', summary: '', body: '', imageUrl: '', category: '', published: true };

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function truncate(text, max = 80) {
  const value = String(text || '').trim();
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const activeTabMeta = CONTENT_TABS.find((t) => t.key === activeTab) || CONTENT_TABS[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminContents({ type: activeTab, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được nội dung.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => {
      const hay = `${row.title || ''} ${row.slug || ''} ${row.summary || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchQuery]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.published !== false).length,
    draft: items.filter((i) => i.published === false).length,
  }), [items]);

  const openCreate = () => {
    setEditing({ mode: 'create' });
    setFormData(EMPTY_FORM);
  };

  const openEdit = (row) => {
    setEditing({ mode: 'edit', row });
    setFormData({
      title: row.title || '',
      slug: row.slug || '',
      summary: row.summary || '',
      body: row.body || '',
      imageUrl: row.imageUrl || '',
      category: row.category || '',
      published: row.published !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = formData.slug.trim() || slugify(formData.title);
    if (!slug) {
      setErrorMsg('Nhập tiêu đề hoặc đường dẫn (slug).');
      return;
    }
    const payload = {
      type: activeTab,
      title: formData.title.trim(),
      slug,
      summary: formData.summary.trim() || null,
      body: formData.body.trim(),
      imageUrl: formData.imageUrl.trim() || null,
      category: formData.category.trim() || null,
      published: !!formData.published,
    };
    const publicPath = `${activeTabMeta.href}`;
    const viewPath = formData.published ? `/content/${slug}` : null;
    try {
      if (editing?.mode === 'edit' && editing?.row?.id) {
        await updateAdminContent(editing.row.id, payload);
        setSuccessMsg(
          formData.published
            ? `Đã cập nhật và đăng. Xem danh sách tại ${publicPath} hoặc bài viết ${viewPath}.`
            : 'Đã lưu bản nháp — chưa hiện bên khách.',
        );
      } else {
        await createAdminContent(payload);
        setSuccessMsg(
          formData.published
            ? `Đã đăng bài. Xem danh sách tại ${publicPath} hoặc bài viết ${viewPath}.`
            : 'Đã tạo bản nháp — chưa hiện bên khách.',
        );
      }
      setEditing(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không lưu được nội dung.');
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Xóa nội dung “${row.title}”?`);
    if (!ok) return;
    try {
      await deleteAdminContent(row.id);
      setSuccessMsg('Đã xóa nội dung.');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không xóa được nội dung.');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.title}</div>
          <div className={styles.subText}>/{row.slug || 'nháp'}</div>
        </div>
      ),
    },
    { key: 'summary', label: 'Tóm tắt', render: (v) => truncate(v, 90) },
    {
      key: 'published',
      label: 'Trạng thái',
      render: (v) => (
        <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {v ? 'Đã đăng' : 'Bản nháp'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Cập nhật',
      render: (v, row) => {
        const ts = v || row.publishedAt;
        return ts ? new Date(ts).toLocaleDateString('vi-VN') : '—';
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openEdit(row)} title="Chỉnh sửa">
            <span className="material-icons-round" style={{ fontSize: 18 }}>edit</span>
          </button>
          {row.published && row.slug ? (
            <a
              className={styles.actionBtn}
              href={`/content/${row.slug}`}
              target="_blank"
              rel="noreferrer"
              title="Xem trên website khách"
            >
              <span className="material-icons-round" style={{ fontSize: 18 }}>open_in_new</span>
            </a>
          ) : null}
          <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDelete(row)} title="Xóa">
            <span className="material-icons-round" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý nội dung</h1>
          <p className={styles.pageSubtitle}>
            Soạn tin tức, câu chuyện, tuyển dụng, trợ giúp và cẩm nang — bài đã đăng hiện trên website khách.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
          <button className={styles.addBtn} onClick={openCreate}>Tạo nội dung</button>
        </div>
      </div>

      <div className={styles.contentTabs}>
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.contentTab} ${activeTab === tab.key ? styles.contentTabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className={styles.formHint}>
        {activeTabMeta.hint}{' '}
        <a href={activeTabMeta.href} target="_blank" rel="noreferrer">Mở trang khách</a>
      </p>

      <div className={styles.statsGrid}>
        <StatCard icon="article" label="Tổng bài viết" value={String(stats.total)} color="blue" />
        <StatCard icon="publish" label="Đã đăng" value={String(stats.published)} color="green" />
        <StatCard icon="drafts" label="Bản nháp" value={String(stats.draft)} color="orange" />
      </div>

      {(errorMsg || successMsg) && (
        <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
          <span className="material-icons-round">{errorMsg ? 'error_outline' : 'check_circle'}</span>
          <span>{errorMsg || successMsg}</span>
          <button className={styles.bannerClose} onClick={() => { setErrorMsg(''); setSuccessMsg(''); }} type="button">
            <span className="material-icons-round">close</span>
          </button>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            className={styles.filterInput}
            placeholder="Tìm bài viết theo tiêu đề, đường dẫn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        totalLabel="bài viết"
        emptyMessage={loading ? 'Đang tải...' : 'Chưa có nội dung'}
      />

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing.mode === 'edit' ? 'Chỉnh sửa nội dung' : 'Tạo nội dung mới'}</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setEditing(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tiêu đề</label>
                    <input
                      className={styles.formInput}
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đường dẫn (slug)</label>
                    <input
                      className={styles.formInput}
                      value={formData.slug}
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="Để trống sẽ tự tạo từ tiêu đề"
                    />
                    <span className={styles.formHint}>Ví dụ: cam-nang-du-lich-bangkok</span>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tóm tắt</label>
                  <textarea
                    className={styles.formTextarea}
                    value={formData.summary}
                    onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))}
                    placeholder="Một đoạn ngắn hiện trên danh sách bài viết"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nhóm / chuyên mục</label>
                    <input
                      className={styles.formInput}
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Ví dụ: Thái Lan, Visa, Full-time"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ảnh bìa (URL)</label>
                    <input
                      className={styles.formInput}
                      value={formData.imageUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nội dung chi tiết</label>
                  <textarea
                    className={styles.formTextarea}
                    value={formData.body}
                    onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trạng thái</label>
                  <select
                    className={styles.formSelect}
                    value={formData.published ? 'true' : 'false'}
                    onChange={(e) => setFormData((p) => ({ ...p, published: e.target.value === 'true' }))}
                  >
                    <option value="true">Đã đăng — hiện trên website khách</option>
                    <option value="false">Bản nháp — chỉ admin thấy</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>Lưu nội dung</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
