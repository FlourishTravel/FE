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
  { key: 'news', label: 'Tin tuc' },
  { key: 'story', label: 'Story' },
  { key: 'career', label: 'Tuyen dung' },
  { key: 'help', label: 'Tro giup' },
  { key: 'guide', label: 'Cam nang' },
];

const EMPTY_FORM = { title: '', slug: '', summary: '', body: '', published: true };

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminContents({ type: activeTab, q: searchQuery, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the tai noi dung');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      published: row.published !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: activeTab,
      title: formData.title.trim(),
      slug: formData.slug.trim() || null,
      summary: formData.summary.trim() || null,
      body: formData.body.trim(),
      published: !!formData.published,
    };
    try {
      if (editing?.mode === 'edit' && editing?.row?.id) {
        await updateAdminContent(editing.row.id, payload);
        setSuccessMsg('Da cap nhat bai viet');
      } else {
        await createAdminContent(payload);
        setSuccessMsg('Da tao bai viet moi');
      }
      setEditing(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the luu noi dung');
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Xoa noi dung "${row.title}"?`);
    if (!ok) return;
    try {
      await deleteAdminContent(row.id);
      setSuccessMsg('Da xoa noi dung');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the xoa noi dung');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Tieu de',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.title}</div>
          <div className={styles.subText}>/{row.slug || 'draft'}</div>
        </div>
      ),
    },
    { key: 'summary', label: 'Tom tat', render: (v) => v || '—' },
    {
      key: 'published',
      label: 'Trang thai',
      render: (v) => <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>{v ? 'Da dang' : 'Ban nhap'}</span>,
    },
    { key: 'updatedAt', label: 'Cap nhat', render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—') },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openEdit(row)}><span className="material-icons-round" style={{ fontSize: 18 }}>edit</span></button>
          <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDelete(row)}><span className="material-icons-round" style={{ fontSize: 18 }}>delete</span></button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quan Ly Noi Dung</h1>
          <p className={styles.pageSubtitle}>Quan ly noi dung theo nhom News, Story, Career va Help</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tai lai</button>
          <button className={styles.addBtn} onClick={openCreate}>Tao noi dung</button>
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

      <div className={styles.statsGrid}>
        <StatCard icon="article" label="Tong bai viet" value={String(stats.total)} color="blue" />
        <StatCard icon="publish" label="Da dang" value={String(stats.published)} color="green" />
        <StatCard icon="drafts" label="Ban nhap" value={String(stats.draft)} color="orange" />
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
          <input className={styles.filterInput} placeholder="Tim bai viet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <DataTable columns={columns} data={items} totalLabel="bai viet" emptyMessage={loading ? 'Dang tai...' : 'Chua co noi dung'} />

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing.mode === 'edit' ? 'Chinh sua noi dung' : 'Tao noi dung moi'}</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setEditing(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tieu de</label>
                    <input className={styles.formInput} value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Slug</label>
                    <input className={styles.formInput} value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tom tat</label>
                  <textarea className={styles.formTextarea} value={formData.summary} onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Noi dung chi tiet</label>
                  <textarea className={styles.formTextarea} value={formData.body} onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trang thai</label>
                  <select className={styles.formSelect} value={formData.published ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, published: e.target.value === 'true' }))}>
                    <option value="true">Da dang</option>
                    <option value="false">Ban nhap</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)}>Huy</button>
                <button type="submit" className={styles.submitBtn}>Luu noi dung</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
