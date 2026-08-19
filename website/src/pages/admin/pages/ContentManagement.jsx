import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminContent,
  deleteAdminContent,
  listAdminContents,
  updateAdminContent,
} from '../../../api/adminContent';
import { uploadMedia } from '../../../api/upload';
import { templatesForType } from './contentTemplates';
import styles from './PromotionManagement.module.css';

const CONTENT_TABS = [
  { key: 'news', label: 'Tin tức', href: '/news', hint: 'Hiện ở Khám phá → Blog du lịch (/news)' },
  { key: 'story', label: 'Câu chuyện', href: '/stories', hint: 'Hiện ở Khám phá → Gợi ý theo mùa (/stories)' },
  { key: 'career', label: 'Tuyển dụng', href: '/careers', hint: 'Hiện ở trang Tuyển dụng (/careers)' },
  { key: 'help', label: 'Trợ giúp', href: '/help', hint: 'Hiện ở trang Trợ giúp (/help)' },
  { key: 'guide', label: 'Cẩm nang', href: '/travel-guide', hint: 'Hiện ở Khám phá → Cẩm nang du lịch (/travel-guide)' },
  { key: 'video', label: 'Video', href: '/videos', hint: 'Hiện ở trang Video (/videos)' },
];

const EMPTY_FORM = {
  title: '', slug: '', summary: '', body: '',
  imageUrl: '', category: '', published: true,
  videoUrl: '', videoMode: 'link', publishedAt: '',
};

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
  const [creatingSamples, setCreatingSamples] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoFileRef = useRef(null);

  const activeTabMeta = CONTENT_TABS.find((t) => t.key === activeTab) || CONTENT_TABS[0];
  const sampleTemplates = templatesForType(activeTab);

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

  const applySample = (tpl) => {
    setEditing({ mode: 'create' });
    setFormData({
      title: tpl.title,
      slug: tpl.slug,
      summary: tpl.summary,
      body: tpl.body,
      imageUrl: tpl.imageUrl || '',
      category: tpl.category || '',
      published: true,
      videoUrl: '',
      videoMode: 'link',
      publishedAt: '',
    });
  };

  const publishSamples = async () => {
    const existing = new Set(items.map((i) => String(i.slug || '').toLowerCase()));
    const toCreate = sampleTemplates.filter((tpl) => !existing.has(tpl.slug.toLowerCase()));
    if (toCreate.length === 0) {
      setSuccessMsg('Các bài mẫu tab này đã có trên hệ thống.');
      return;
    }
    setCreatingSamples(true);
    setErrorMsg('');
    try {
      let ok = 0;
      let failed = 0;
      for (const tpl of toCreate) {
        try {
          await createAdminContent({
            type: activeTab,
            title: tpl.title,
            slug: tpl.slug,
            summary: tpl.summary,
            body: tpl.body,
            imageUrl: tpl.imageUrl || null,
            category: tpl.category || null,
            published: true,
          });
          ok += 1;
        } catch {
          failed += 1;
        }
      }
      setSuccessMsg(
        `Đã đăng ${ok} bài mẫu${failed ? `, bỏ qua ${failed} bài lỗi/trùng` : ''}. Xem tại ${activeTabMeta.href}.`,
      );
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không tạo được bài mẫu.');
    } finally {
      setCreatingSamples(false);
    }
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
      videoUrl: row.videoUrl || '',
      videoMode: 'link',
      publishedAt: row.publishedAt
        ? new Date(row.publishedAt).toISOString().slice(0, 16)
        : '',
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    setErrorMsg('');
    try {
      const url = await uploadMedia(file);
      setFormData((p) => ({ ...p, videoUrl: url }));
      setSuccessMsg('Tải video lên thành công.');
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được video.');
    } finally {
      setVideoUploading(false);
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
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
      videoUrl: formData.videoUrl.trim() || null,
      category: formData.category.trim() || null,
      published: !!formData.published,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
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

      {sampleTemplates.length > 0 && (
        <div>
          <div className={styles.pageHeader} style={{ marginBottom: 8 }}>
            <h2 className={styles.sectionTitle}>Bài mẫu {activeTabMeta.label.toLowerCase()}</h2>
            <button
              type="button"
              className={styles.addBtn}
              onClick={publishSamples}
              disabled={creatingSamples}
            >
              {creatingSamples ? 'Đang đăng...' : `Đăng ${sampleTemplates.length} bài mẫu tab này`}
            </button>
          </div>
          <p className={styles.formHint} style={{ marginBottom: 10 }}>
            Bấm một thẻ để điền form rồi Lưu, hoặc đăng hết mẫu (bỏ qua slug đã có).
          </p>
          <div className={styles.templateGrid}>
            {sampleTemplates.map((tpl) => (
              <button
                key={tpl.slug}
                type="button"
                className={styles.templateCard}
                onClick={() => applySample(tpl)}
              >
                <span className={styles.templateKind}>{tpl.category || activeTabMeta.label}</span>
                <span className={styles.templateTitle}>{tpl.title}</span>
                <span className={styles.templateBody}>{truncate(tpl.summary, 110)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày đăng</label>
                    <input
                      type="datetime-local"
                      className={styles.formInput}
                      value={formData.publishedAt}
                      onChange={(e) => setFormData((p) => ({ ...p, publishedAt: e.target.value }))}
                    />
                    <span className={styles.formHint}>Để trống sẽ tự dùng thời điểm lưu (nếu đã đăng)</span>
                  </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Video (tuỳ chọn)</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <button
                        type="button"
                        className={formData.videoMode === 'link' ? styles.submitBtn : styles.cancelBtn}
                        style={{ fontSize: 13, padding: '4px 12px' }}
                        onClick={() => setFormData((p) => ({ ...p, videoMode: 'link' }))}
                      >
                        Nhập link
                      </button>
                      <button
                        type="button"
                        className={formData.videoMode === 'upload' ? styles.submitBtn : styles.cancelBtn}
                        style={{ fontSize: 13, padding: '4px 12px' }}
                        onClick={() => setFormData((p) => ({ ...p, videoMode: 'upload' }))}
                      >
                        Tải lên S3
                      </button>
                    </div>
                    {formData.videoMode === 'link' ? (
                      <input
                        className={styles.formInput}
                        value={formData.videoUrl}
                        onChange={(e) => setFormData((p) => ({ ...p, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/... hoặc URL video trực tiếp"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          ref={videoFileRef}
                          type="file"
                          accept="video/*"
                          className={styles.formInput}
                          onChange={handleVideoUpload}
                          disabled={videoUploading}
                          style={{ flex: 1 }}
                        />
                        {videoUploading && (
                          <span style={{ fontSize: 13, color: '#6b7280' }}>Đang tải lên...</span>
                        )}
                      </div>
                    )}
                    {formData.videoUrl ? (
                      <div style={{ marginTop: 8 }}>
                        <span className={styles.formHint}>URL: </span>
                        <a
                          href={formData.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, wordBreak: 'break-all' }}
                        >
                          {formData.videoUrl}
                        </a>
                      </div>
                    ) : null}
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
