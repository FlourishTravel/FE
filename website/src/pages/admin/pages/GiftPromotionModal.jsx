import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { listAdminCustomers } from '../../../api/adminCustomers';
import {
  grantAdminPromotion,
  listAdminPromotionGrants,
  revokeAdminPromotionGrant,
} from '../../../api/adminPromotions';
import styles from './PromotionManagement.module.css';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

const GiftPromotionModal = ({ promotion, onClose, onChanged }) => {
  const [assignees, setAssignees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tier, setTier] = useState('VIP');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const loadAssignees = useCallback(async () => {
    if (!promotion?.id) return;
    setLoadingList(true);
    setErrorMsg('');
    try {
      const rows = await listAdminPromotionGrants(promotion.id);
      setAssignees(rows);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách đã tặng.');
    } finally {
      setLoadingList(false);
    }
  }, [promotion?.id]);

  useEffect(() => {
    loadAssignees();
  }, [loadAssignees]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCustomers(true);
      try {
        const data = await listAdminCustomers({
          q: debouncedQuery,
          tier,
          page: 0,
          size: 30,
        });
        if (alive) setCustomers(data.content || []);
      } catch (err) {
        if (alive) setErrorMsg(err?.message || 'Không tải được khách hàng.');
      } finally {
        if (alive) setLoadingCustomers(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedQuery, tier]);

  const grantedIds = useMemo(
    () => new Set(assignees.map((a) => a.userId)),
    [assignees],
  );

  const toggleSelect = (id) => {
    if (grantedIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGrant = async () => {
    const userIds = [...selected];
    if (userIds.length === 0) {
      setErrorMsg('Chọn ít nhất một khách chưa được tặng mã.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await grantAdminPromotion(promotion.id, userIds);
      setAssignees(result?.assignees || []);
      setSelected(new Set());
      setSuccessMsg(`Đã tặng ${result?.granted ?? userIds.length} khách. Họ sẽ thấy mã trong Voucher của tôi.`);
      onChanged?.();
    } catch (err) {
      setErrorMsg(err?.message || 'Không tặng được mã.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (userId) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await revokeAdminPromotionGrant(promotion.id, userId);
      setAssignees((prev) => prev.filter((a) => a.userId !== userId));
      setSuccessMsg('Đã thu hồi mã.');
      onChanged?.();
    } catch (err) {
      setErrorMsg(err?.message || 'Không thu hồi được mã.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPublic = promotion?.isPublic !== false;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.giftModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Tặng mã {promotion?.code}</h2>
            <p className={styles.giftSubtitle}>
              {isPublic
                ? 'Mã đang công khai — mọi khách vẫn thấy trên trang Voucher. Tắt Công khai nếu đây là voucher VIP.'
                : 'Mã tặng riêng — chỉ khách được chọn mới thấy và dùng được khi thanh toán.'}
            </p>
          </div>
          <button className={styles.actionBtn} type="button" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className={styles.modalBody}>
          {(errorMsg || successMsg) && (
            <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
              <span className="material-icons-round">{errorMsg ? 'error_outline' : 'check_circle'}</span>
              <span>{errorMsg || successMsg}</span>
            </div>
          )}

          <div className={styles.giftToolbar}>
            <div className={styles.filterTabs}>
              {[
                { key: 'VIP', label: 'VIP' },
                { key: 'GOLD', label: 'Gold' },
                { key: 'all', label: 'Tất cả' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.filterTab} ${tier === tab.key ? styles.filterTabActive : ''}`}
                  onClick={() => setTier(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className={styles.filterSearch}>
              <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
              <input
                className={styles.filterInput}
                placeholder="Tìm tên, email, SĐT..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.customerPickList}>
            {loadingCustomers && <p className={styles.formHint}>Đang tải khách hàng...</p>}
            {!loadingCustomers && customers.length === 0 && (
              <p className={styles.formHint}>Không có khách phù hợp.</p>
            )}
            {customers.map((c) => {
              const already = grantedIds.has(c.id);
              const checked = already || selected.has(c.id);
              return (
                <label key={c.id} className={`${styles.pickRow} ${already ? styles.pickRowDisabled : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={already}
                    onChange={() => toggleSelect(c.id)}
                  />
                  <span className={styles.pickName}>{c.fullName || c.email}</span>
                  <span className={styles.pickMeta}>{c.email}</span>
                  <span className={`${styles.statusBadge} ${c.tier === 'VIP' ? styles.badgeWarning : styles.badgeNeutral}`}>
                    {c.tier || 'STANDARD'}
                  </span>
                  {already && <span className={styles.formHint}>Đã tặng</span>}
                </label>
              );
            })}
          </div>

          <div className={styles.giftActions}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleGrant}
              disabled={submitting || selected.size === 0}
            >
              Tặng cho {selected.size || 0} khách
            </button>
          </div>

          <h3 className={styles.sectionTitle}>Đã tặng ({assignees.length})</h3>
          {loadingList && <p className={styles.formHint}>Đang tải...</p>}
          {!loadingList && assignees.length === 0 && (
            <p className={styles.formHint}>Chưa tặng cho khách nào.</p>
          )}
          <ul className={styles.assigneeList}>
            {assignees.map((a) => (
              <li key={a.userId} className={styles.assigneeRow}>
                <div>
                  <div className={styles.pickName}>{a.fullName || a.email}</div>
                  <div className={styles.pickMeta}>
                    {a.email} · tặng {formatDate(a.grantedAt)}
                    {a.usedAt ? ` · đã dùng ${formatDate(a.usedAt)}` : ' · chưa dùng'}
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={() => handleRevoke(a.userId)}
                  disabled={submitting}
                  title="Thu hồi"
                >
                  <span className="material-icons-round" style={{ fontSize: 18 }}>person_remove</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GiftPromotionModal;
