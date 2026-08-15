import { CHAT_REACTION_EMOJIS } from '../../api/tourChat';

export function formatMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function chatSenderLabel(msg, currentUserId) {
  if (msg?.senderId && currentUserId && String(msg.senderId) === String(currentUserId)) {
    return 'Bạn';
  }
  const r = (msg?.senderRole || '').toUpperCase();
  if (r === 'FLORA') return 'Flora';
  if (r === 'TOUR_GUIDE') {
    return msg.senderName ? `${msg.senderName} (HDV)` : 'Hướng dẫn viên';
  }
  if (r === 'ADMIN') return msg.senderName || 'Quản trị';
  return msg?.senderName || 'Thành viên';
}

export function mentionTag(member) {
  if (!member) return '@';
  if (member.flora || String(member.role || '').toUpperCase() === 'FLORA') {
    return '@Flora';
  }
  const name = String(member.fullName || '').trim() || 'Thành viên';
  return `@${name}`;
}

export function memberSubtitle(member) {
  if (member?.flora || String(member?.role || '').toUpperCase() === 'FLORA') {
    return 'Trợ lý AI';
  }
  const r = String(member?.role || '').toUpperCase();
  if (r === 'TOUR_GUIDE') return 'Hướng dẫn viên';
  if (r === 'ADMIN') return 'Quản trị';
  return 'Thành viên đoàn';
}

/**
 * @param {string} text
 * @param {number} caret
 * @returns {{ start: number, query: string } | null}
 */
export function getMentionState(text, caret) {
  const value = text || '';
  const pos = Number.isFinite(caret) ? caret : value.length;
  const before = value.slice(0, pos);
  const at = before.lastIndexOf('@');
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before.charAt(at - 1))) return null;
  const query = before.slice(at + 1);
  if (/[\n]/.test(query)) return null;
  return { start: at, query };
}

export function applyMention(text, caret, member) {
  const state = getMentionState(text, caret);
  const tag = `${mentionTag(member)} `;
  if (!state) {
    const insertAt = Number.isFinite(caret) ? caret : (text || '').length;
    const next = `${(text || '').slice(0, insertAt)}${tag}${(text || '').slice(insertAt)}`;
    return { text: next, caret: insertAt + tag.length };
  }
  const next = `${text.slice(0, state.start)}${tag}${text.slice(caret)}`;
  return { text: next, caret: state.start + tag.length };
}

export function filterMentionMembers(members, query, currentUserId) {
  const q = String(query || '').trim().toLowerCase();
  const list = Array.isArray(members) ? members : [];
  return list.filter((m) => {
    if (!m?.userId) return false;
    if (currentUserId && String(m.userId) === String(currentUserId) && !m.flora) return false;
    if (!q) return true;
    const name = String(m.fullName || '').toLowerCase();
    const role = memberSubtitle(m).toLowerCase();
    return name.includes(q) || role.includes(q) || (m.flora && 'flora ai'.includes(q));
  });
}

export function highlightMentions(text, members) {
  const value = text == null ? '' : String(text);
  const names = [...new Set((Array.isArray(members) ? members : [])
    .map((m) => (m?.flora ? 'Flora' : String(m?.fullName || '').trim()))
    .filter(Boolean))]
    .sort((a, b) => b.length - a.length);
  if (!names.length || !value) return [{ text: value, mention: false }];
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`@(?:${escaped.join('|')})`, 'gi');
  const parts = [];
  let last = 0;
  for (const match of value.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push({ text: value.slice(last, idx), mention: false });
    parts.push({ text: match[0], mention: true });
    last = idx + match[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last), mention: false });
  return parts.length ? parts : [{ text: value, mention: false }];
}

export { CHAT_REACTION_EMOJIS };
