import { resolveMediaUrl } from '../api/config';

function initialOf(name) {
  const t = (name || '').trim();
  return t ? t.charAt(0).toUpperCase() : '?';
}

/** Ảnh đại diện tròn; không có URL thì hiện chữ cái đầu tên. */
export default function ChatAvatar({ name, url, className }) {
  const src = resolveMediaUrl(url);
  if (src) {
    return <img className={className} src={src} alt={name || ''} />;
  }
  return (
    <div className={className} aria-hidden="true">
      {initialOf(name)}
    </div>
  );
}
