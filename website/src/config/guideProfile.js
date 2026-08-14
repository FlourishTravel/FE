export const GUIDE_LANGUAGE_OPTIONS = [
  'Tiếng Việt',
  'Tiếng Anh',
  'Tiếng Thái',
  'Tiếng Trung',
  'Tiếng Pháp',
  'Tiếng Khmer',
];

export const GUIDE_SPECIALTY_OPTIONS = [
  'Ẩm thực',
  'Văn hóa',
  'Phiêu lưu',
  'Wellness',
  'Bền vững',
  'Nghệ thuật',
  'Trong nước',
  'Thái Lan',
];

export function toggleChip(list, value) {
  const current = Array.isArray(list) ? list : [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}
