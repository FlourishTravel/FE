import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPostTourFeedbackContext,
  previewFeedbackPreferences,
  updateFloraPreferences,
} from '../api/flora';
import { createReview } from '../api/reviews';
import styles from './FloraPostTourFeedback.module.css';

function StarRow({ value, onChange, disabled }) {
  return (
    <div className={styles.stars} role="group" aria-label="Đánh giá sao">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? styles.starOn : styles.starOff}
          disabled={disabled}
          onClick={() => onChange(n)}
          aria-label={`${n} sao`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ChipSection({ title, tags, selected, onToggle, disabled }) {
  const liked = tags.filter((t) => t.category === 'LIKED');
  const improve = tags.filter((t) => t.category === 'IMPROVE');
  const renderGroup = (list) => (
    <div className={styles.chips}>
      {list.map((tag) => {
        const on = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            className={on ? styles.chipOn : styles.chip}
            disabled={disabled}
            onClick={() => onToggle(tag.id)}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
  if (!tags.length) return null;
  return (
    <div className={styles.chipSection}>
      <h4 className={styles.subTitle}>{title}</h4>
      {liked.length > 0 && (
        <>
          <p className={styles.hint}>Bạn thích điều gì nhất trong chuyến đi này?</p>
          {renderGroup(liked)}
        </>
      )}
      {improve.length > 0 && (
        <>
          <p className={styles.hint}>Điều gì Flora có thể cải thiện cho lần sau?</p>
          {renderGroup(improve)}
        </>
      )}
    </div>
  );
}

export default function FloraPostTourFeedback({ bookingId }) {
  const [ctx, setCtx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [done, setDone] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getPostTourFeedbackContext(bookingId);
      if (res.success) setCtx(res.data);
      else setError(res.message || 'Không tải phản hồi');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!ctx?.personalizationEnabled || selectedTags.length === 0) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      try {
        const res = await previewFeedbackPreferences(selectedTags);
        if (!cancelled && res.success) setPreview(res.data);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ctx?.personalizationEnabled, selectedTags]);

  const toggleTag = (id) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitReview = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      const tags = ctx?.personalizationEnabled ? selectedTags : [];
      await createReview({ bookingId, rating, comment: comment.trim() || null, feedbackTags: tags });
      setReviewSubmitted(true);
      setDone(true);
      await load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const savePreferences = async () => {
    if (!preview?.patchRequest) return;
    setSavingPrefs(true);
    setActionError(null);
    try {
      await updateFloraPreferences(preview.patchRequest);
      setPrefsSaved(true);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return <div className={styles.panel}><p className={styles.muted}>Đang tải phản hồi chuyến đi…</p></div>;
  }
  if (error) {
    return <div className={styles.panel}><p className={styles.error}>{error}</p></div>;
  }
  if (!ctx?.eligible) return null;

  if (ctx.alreadySubmitted && ctx.existingFeedback) {
    return (
      <div className={styles.panel}>
        <p className={styles.intro}>
          Bạn đã gửi đánh giá cho chuyến đi này rồi. Cảm ơn bạn đã chia sẻ cùng Flora.
        </p>
        <StarRow value={ctx.existingFeedback.rating || 5} onChange={() => {}} disabled />
        {ctx.existingFeedback.comment ? (
          <p className={styles.muted}>{ctx.existingFeedback.comment}</p>
        ) : null}
      </div>
    );
  }

  if (done && reviewSubmitted) {
    return (
      <div className={styles.panel}>
        <p className={styles.success}>Cảm ơn bạn đã chia sẻ cùng Flora.</p>
        {prefsSaved ? <p className={styles.muted}>Đã lưu sở thích cho những chuyến đi sau.</p> : null}
        {ctx.personalizationEnabled && selectedTags.length > 0 && !prefsSaved && preview?.changes?.length > 0 ? (
          <div className={styles.prefBlock}>
            <h4 className={styles.subTitle}>Gợi ý sở thích cho những chuyến đi tiếp theo</h4>
            <ul className={styles.changeList}>
              {preview.changes.map((c, i) => (
                <li key={i}>{c.field}: {c.after}</li>
              ))}
            </ul>
            <button type="button" className={styles.btnPrimary} disabled={savingPrefs} onClick={savePreferences}>
              Lưu sở thích này
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Đánh giá chuyến đi</h3>
      <p className={styles.intro}>
        Chuyến đi của bạn đã kết thúc rồi. Flora rất muốn biết trải nghiệm của bạn để lần sau gợi ý phù hợp hơn.
      </p>

      <StarRow value={rating} onChange={setRating} disabled={submitting} />

      <label className={styles.label}>
        Nhận xét (tuỳ chọn)
        <textarea
          className={styles.textarea}
          rows={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
        />
      </label>

      {ctx.personalizationEnabled ? (
        <>
          <hr className={styles.divider} />
          <h4 className={styles.subTitle}>Gợi ý để Flora hiểu bạn hơn</h4>
          <ChipSection
            title=""
            tags={ctx.availableTags || []}
            selected={selectedTags}
            onToggle={toggleTag}
            disabled={submitting}
          />
          {previewLoading ? <p className={styles.muted}>Đang xem trước sở thích…</p> : null}
          {preview?.changes?.length > 0 ? (
            <div className={styles.prefBlock}>
              <p className={styles.hint}>Gợi ý sở thích cho những chuyến đi tiếp theo</p>
              <ul className={styles.changeList}>
                {preview.changes.map((c, i) => (
                  <li key={i}>{c.field}: {c.after}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <p className={styles.muted}>
          Bạn vẫn có thể gửi đánh giá. Hãy bật cá nhân hóa trong{' '}
          <Link to="/privacy-settings">Cài đặt Flora AI</Link> nếu muốn Flora ghi nhớ sở thích cho những chuyến đi sau.
        </p>
      )}

      {actionError ? <p className={styles.error}>{actionError}</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} disabled={submitting} onClick={submitReview}>
          {ctx.personalizationEnabled && selectedTags.length > 0 ? 'Chỉ gửi đánh giá' : 'Gửi đánh giá'}
        </button>
        {ctx.personalizationEnabled && preview?.changes?.length > 0 ? (
          <button
            type="button"
            className={styles.btnSecondary}
            disabled={submitting || savingPrefs || !reviewSubmitted}
            onClick={savePreferences}
          >
            Lưu sở thích này
          </button>
        ) : null}
      </div>
    </div>
  );
}
