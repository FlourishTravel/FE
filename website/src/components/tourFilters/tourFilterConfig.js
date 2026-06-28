/** Cấu hình bộ lọc tour — render từ mảng, không hard-code trong UI. */

export const PRICE_BOUNDS = { min: 500_000, max: 15_000_000, step: 100_000 };

export const PRICE_PRESETS = [
  { key: 'under1m', label: 'Dưới 1 triệu', min: 0, max: 1_000_000 },
  { key: '1-3m', label: '1 – 3 triệu', min: 1_000_000, max: 3_000_000 },
  { key: '3-5m', label: '3 – 5 triệu', min: 3_000_000, max: 5_000_000 },
  { key: '5-10m', label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
  { key: 'over10m', label: 'Trên 10 triệu', min: 10_000_000, max: 99_999_999_999 },
];

export const DURATION_OPTIONS = [
  { key: '1d', label: '1 ngày', days: 1, nights: null },
  { key: '2d1n', label: '2 ngày 1 đêm', days: 2, nights: 1 },
  { key: '3d2n', label: '3 ngày 2 đêm', days: 3, nights: 2 },
  { key: '4d3n', label: '4 ngày 3 đêm', days: 4, nights: 3 },
  { key: '5d4n', label: '5 ngày 4 đêm', days: 5, nights: 4 },
  { key: '5d+', label: 'Trên 5 ngày', minDays: 6 },
];

export const DEPARTURE_PRESETS = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần này' },
  { key: 'next-week', label: 'Tuần sau' },
  { key: 'this-month', label: 'Tháng này' },
  { key: 'custom', label: 'Chọn ngày khác' },
];

export const TOUR_TYPE_OPTIONS = [
  { key: 'personal', label: 'Tour cá nhân' },
  { key: 'group', label: 'Tour nhóm' },
  { key: 'family', label: 'Tour gia đình' },
  { key: 'corporate', label: 'Tour doanh nghiệp', segment: 'corporate' },
  { key: 'school', label: 'Tour trường học', segment: 'school' },
];

export const AVAILABILITY_OPTIONS = [
  { key: 'many', label: 'Còn nhiều chỗ' },
  { key: 'almost_full', label: 'Sắp hết chỗ' },
  { key: 'few', label: 'Chỉ còn vài chỗ' },
  { key: 'full', label: 'Đã đầy' },
];

export const RATING_OPTIONS = [
  { key: 5, label: '5.0', min: 5 },
  { key: 4.5, label: '4.5+ trở lên', min: 4.5 },
  { key: 4, label: '4+ trở lên', min: 4 },
  { key: 3, label: '3+ trở lên', min: 3 },
];

export const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ biến nhất' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'price_asc', label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'rating_desc', label: 'Đánh giá cao nhất' },
  { key: 'departure_asc', label: 'Khởi hành sớm nhất' },
  { key: 'bestseller', label: 'Bán chạy nhất' },
];

export function createDefaultFilters(search = '') {
  return {
    search: search || '',
    categories: [],
    priceMin: PRICE_BOUNDS.min,
    priceMax: PRICE_BOUNDS.max,
    pricePreset: null,
    durations: [],
    departureDate: '',
    departurePreset: null,
    tourType: null,
    availability: [],
    minRating: null,
    sort: 'popular',
  };
}
