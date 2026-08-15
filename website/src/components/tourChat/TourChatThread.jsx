import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Reply, Send, SmilePlus, X } from 'lucide-react';
import {
  sendBookingChatMessage,
  toggleChatReaction,
} from '../../api/tourChat';
import ChatAvatar from '../ChatAvatar';
import {
  applyMention,
  chatSenderLabel,
  CHAT_REACTION_EMOJIS,
  filterMentionMembers,
  formatMsgTime,
  getMentionState,
  highlightMentions,
  memberSubtitle,
} from './chatHelpers';
import styles from './TourChatThread.module.css';

function MessageText({ text, members, className, mentionClass }) {
  const parts = highlightMentions(text, members);
  return (
    <p className={className}>
      {parts.map((part, idx) => (
        part.mention
          ? <span key={`${idx}-${part.text}`} className={mentionClass}>{part.text}</span>
          : <React.Fragment key={`${idx}-${part.text}`}>{part.text}</React.Fragment>
      ))}
    </p>
  );
}

export default function TourChatThread({
  bookingId,
  currentUser,
  members = [],
  messages = [],
  setMessages,
  canChat = false,
  compact = false,
  emptyHint = 'Chưa có tin nhắn. Nhấn @ để gắn tên (có Flora), hoặc trả lời / thả icon như Zalo.',
  onError,
}) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const msgRefs = useRef(new Map());

  const currentUserId = currentUser?.id;
  const mentionCandidates = useMemo(
    () => filterMentionMembers(members, mentionQuery, currentUserId),
    [members, mentionQuery, currentUserId],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setReplyTo(null);
    setPickerFor(null);
    setInput('');
    setMentionOpen(false);
  }, [bookingId]);

  useEffect(() => {
    if (!pickerFor) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPickerFor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pickerFor]);

  const syncMention = (value, caret) => {
    const state = getMentionState(value, caret);
    if (!state) {
      setMentionOpen(false);
      setMentionQuery('');
      return;
    }
    setMentionOpen(true);
    setMentionQuery(state.query);
    setMentionIndex(0);
  };

  const insertMember = (member) => {
    const el = inputRef.current;
    const caret = el ? el.selectionStart : input.length;
    const next = applyMention(input, caret, member);
    setInput(next.text);
    setMentionOpen(false);
    setMentionQuery('');
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(next.caret, next.caret);
    });
  };

  const replaceMessage = (dto) => {
    if (!dto?.id || !setMessages) return;
    setMessages((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const idx = list.findIndex((m) => m.id === dto.id);
      if (idx < 0) return [...list, dto];
      const copy = list.slice();
      copy[idx] = { ...list[idx], ...dto };
      return copy;
    });
  };

  const handleSend = async () => {
    if (!bookingId || !canChat || !input.trim() || sending) return;
    setSending(true);
    try {
      const dto = await sendBookingChatMessage(bookingId, input.trim(), replyTo?.id);
      setInput('');
      setReplyTo(null);
      setMentionOpen(false);
      if (dto?.id) replaceMessage(dto);
    } catch (e) {
      onError?.(e.message || 'Gửi tin nhắn thất bại.');
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (message, emoji) => {
    if (!message?.id || !canChat) return;
    setPickerFor(null);
    try {
      const dto = await toggleChatReaction(message.id, emoji);
      if (dto?.id) replaceMessage(dto);
    } catch (e) {
      onError?.(e.message || 'Không thả được icon.');
    }
  };

  const startReply = (message) => {
    setReplyTo(message);
    setPickerFor(null);
    inputRef.current?.focus();
  };

  const scrollToMessage = (id) => {
    const node = msgRefs.current.get(id);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const onInputKeyDown = (e) => {
    if (mentionOpen && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMember(mentionCandidates[mentionIndex] || mentionCandidates[0]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${styles.thread} ${compact ? styles.threadCompact : ''}`}>
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.emptyHint}>{emptyHint}</p>
        ) : (
          messages.map((m) => {
            const isMe = currentUserId && String(currentUserId) === String(m.senderId);
            const isFlora = String(m.senderRole || '').toUpperCase() === 'FLORA';
            const displayName = chatSenderLabel(m, currentUserId);
            const bubbleClass = isMe ? styles.bubbleMe : isFlora ? `${styles.bubble} ${styles.bubbleFlora}` : styles.bubble;
            const reactions = Array.isArray(m.reactions) ? m.reactions : [];
            return (
              <div
                key={m.id}
                ref={(node) => {
                  if (node) msgRefs.current.set(m.id, node);
                  else msgRefs.current.delete(m.id);
                }}
                className={isMe ? styles.msgRowMe : styles.msgRow}
              >
                {!isMe && (
                  <ChatAvatar
                    name={m.senderName}
                    url={m.senderAvatarUrl}
                    flora={isFlora}
                    className={`${styles.avatar} ${isFlora ? styles.avatarFlora : ''}`}
                  />
                )}
                <div className={`${styles.bubbleWrap} ${isMe ? styles.bubbleWrapMe : ''}`}>
                  <div className={bubbleClass}>
                    <span className={styles.bubbleSender}>
                      {displayName}
                      {m.isPinned ? ' · Đã ghim' : ''}
                    </span>
                    {m.replyTo?.id && (
                      <button
                        type="button"
                        className={styles.quote}
                        onClick={() => scrollToMessage(m.replyTo.id)}
                      >
                        <span className={styles.quoteName}>{m.replyTo.senderName || 'Tin nhắn'}</span>
                        <span className={styles.quoteText}>{m.replyTo.content || ''}</span>
                      </button>
                    )}
                    <MessageText
                      text={m.content}
                      members={members}
                      className={styles.bubbleText}
                      mentionClass={styles.mention}
                    />
                    <span className={styles.bubbleTime}>{formatMsgTime(m.createdAt)}</span>
                    {canChat && (
                      <div className={styles.hoverBar}>
                        <button type="button" className={styles.hoverBtn} title="Thả icon" onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}>
                          <SmilePlus size={14} />
                        </button>
                        <button type="button" className={styles.hoverBtn} title="Trả lời" onClick={() => startReply(m)}>
                          <Reply size={14} />
                        </button>
                      </div>
                    )}
                    {pickerFor === m.id && (
                      <div className={`${styles.picker} ${isMe ? styles.pickerMe : ''}`}>
                        {CHAT_REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={styles.pickerBtn}
                            onClick={() => handleReact(m, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {reactions.length > 0 && (
                    <div className={styles.reactions}>
                      {reactions.map((r) => (
                        <button
                          key={r.type}
                          type="button"
                          className={`${styles.reactionChip} ${r.reactedByMe ? styles.reactionMine : ''}`}
                          onClick={() => handleReact(m, r.type)}
                          disabled={!canChat}
                        >
                          {r.type} {r.count > 1 ? r.count : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isMe && (
                  <ChatAvatar
                    name={currentUser?.fullName || currentUser?.name || 'Bạn'}
                    url={m.senderAvatarUrl || currentUser?.avatarUrl || currentUser?.avatar}
                    className={styles.avatar}
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className={styles.composer}>
        {mentionOpen && (
          <div className={styles.mentionList} role="listbox">
            {mentionCandidates.length === 0 ? (
              <div className={styles.mentionEmpty}>Không tìm thấy thành viên</div>
            ) : mentionCandidates.map((member, idx) => (
              <button
                key={member.userId}
                type="button"
                className={`${styles.mentionItem} ${idx === mentionIndex ? styles.mentionItemActive : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMember(member);
                }}
              >
                <ChatAvatar
                  name={member.fullName}
                  url={member.avatarUrl}
                  flora={member.flora}
                  className={styles.mentionAvatar}
                />
                <span>
                  <span className={styles.mentionName}>{member.fullName}</span>
                  <span className={styles.mentionRole}>{memberSubtitle(member)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {replyTo && (
          <div className={styles.replyBar}>
            <div className={styles.replyMeta}>
              <span className={styles.replyLabel}>
                Trả lời {chatSenderLabel(replyTo, currentUserId)}
              </span>
              <span className={styles.replyPreview}>{replyTo.content}</span>
            </div>
            <button type="button" className={styles.replyClose} onClick={() => setReplyTo(null)} aria-label="Hủy trả lời">
              <X size={16} />
            </button>
          </div>
        )}
        <div className={styles.inputRow}>
          <textarea
            ref={inputRef}
            className={styles.input}
            rows={1}
            placeholder="Nhắn đoàn, nhấn @ để gắn tên (có Flora)..."
            value={input}
            disabled={sending || !canChat}
            onChange={(e) => {
              setInput(e.target.value);
              syncMention(e.target.value, e.target.selectionStart);
            }}
            onClick={(e) => syncMention(e.target.value, e.target.selectionStart)}
            onKeyUp={(e) => syncMention(e.target.value, e.target.selectionStart)}
            onKeyDown={onInputKeyDown}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={sending || !canChat || !input.trim()}
            aria-label="Gửi"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
