/** Cấu hình menu điều hướng — map ra Navbar / Footer / mobile. */

export const EXPLORE_MENU = [
    { label: 'Điểm đến', href: '/destinations', description: 'Khám phá điểm đến nổi bật' },
    { label: 'Đội ngũ HDV', href: '/our-guides', description: 'Hướng dẫn viên Flourish Travel' },
    { label: 'Cẩm nang du lịch', href: '/travel-guide', description: 'Mẹo, checklist và kinh nghiệm' },
    { label: 'Blog du lịch', href: '/news', description: 'Tin tức và câu chuyện du lịch' },
    { label: 'Câu chuyện', href: '/stories', description: 'Câu chuyện thương hiệu & hành trình' },
    { label: 'Ưu đãi', href: '/my-vouchers', description: 'Mã giảm giá đang áp dụng' },
];

/** Menu Tour — fallback khi chưa tải được danh mục từ DB. */
export const TOUR_MENU_FALLBACK = [
    { label: 'Tất cả tour', href: '/tours' },
    { label: 'Tour yêu thích', href: '/tours?wishlist=1' },
];

/** @deprecated Dùng buildTourNavMenu(categories) — giữ alias cho tương thích. */
export const TOUR_MENU = TOUR_MENU_FALLBACK;

/** Tạo menu Tour từ danh mục API (categories). */
export function buildTourNavMenu(categories = []) {
    return [
        { label: 'Tất cả tour', href: '/tours' },
        ...categories.map((cat) => ({
            label: cat.name,
            href: `/tours?categoryId=${encodeURIComponent(cat.id)}`,
        })),
        { label: 'Tour yêu thích', href: '/tours?wishlist=1' },
    ];
}

export const EXPERIENCE_MENU = [
    { label: 'Vé tham quan', href: '/activities?type=ticket' },
    { label: 'Hoạt động', href: '/activities' },
    { label: 'Combo du lịch', href: '/activities?type=combo' },
    { label: 'Workshop / Event', href: '/activities?type=event' },
];

/** Menu chính desktop — dropdown hoặc link trực tiếp. */
export const MAIN_NAV = [
    { id: 'explore', label: 'Khám phá', type: 'dropdown', items: EXPLORE_MENU },
    { id: 'tours', label: 'Tour', type: 'dropdown', dynamic: 'categories' },
    { id: 'experience', label: 'Trải nghiệm', type: 'dropdown', items: EXPERIENCE_MENU },
    { id: 'my-trips', label: 'Chuyến đi của tôi', type: 'link', href: '/my-journey' },
    { id: 'flora', label: 'Flora AI', type: 'flora' },
];

/** Mục profile dropdown — action: logout | flora */
export const PROFILE_MENU = [
    { label: 'Hồ sơ cá nhân', href: '/profile', icon: 'person' },
    { label: 'Chuyến đi của tôi', href: '/my-journey', icon: 'luggage' },
    { label: 'Wishlist', href: '/tours?wishlist=1', icon: 'favorite' },
    { label: 'Ví của tôi / Thanh toán', href: '/my-wallet', icon: 'account_balance_wallet' },
    { label: 'Voucher / Mã giảm giá', href: '/my-vouchers', icon: 'local_offer' },
    { label: 'Điểm thưởng', href: '/my-points', icon: 'stars' },
    { label: 'Đánh giá của tôi', href: '/my-reviews', icon: 'rate_review' },
    { label: 'Flora AI', action: 'flora', icon: 'smart_toy' },
    { label: 'Cài đặt', href: '/privacy-settings', icon: 'settings' },
    { label: 'Trợ giúp', href: '/help', icon: 'help_outline' },
    { label: 'Đăng xuất', action: 'logout', icon: 'logout', dividerBefore: true },
];

/** Quick actions popup Flora FAB */
export const FLORA_QUICK_ACTIONS = [
    { id: 'suggest', label: 'Gợi ý tour', prompt: 'Gợi ý tour phù hợp cho tôi trong tháng này' },
    { id: 'plan', label: 'Lên lịch trình', prompt: 'Giúp mình lên lịch trình 3 ngày 2 đêm' },
    { id: 'budget', label: 'Tính chi phí', prompt: 'Ước tính chi phí chuyến đi 5 ngày cho 2 người' },
    { id: 'guide', label: 'Chat với HDV', prompt: 'HDV có thể hỗ trợ gì cho chuyến đi của mình?' },
    { id: 'gift', label: 'Mua quà tại chỗ', prompt: 'Mình đang đứng tại siêu thị/mall, gợi ý mua quà cho người thân theo ngân sách baht. Nhắc giờ tập trung nếu có.' },
    { id: 'track', label: 'Theo dõi chuyến đi', href: '/my-journey' },
];

export const TRIP_STATUS_FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'upcoming', label: 'Sắp khởi hành' },
    { id: 'ongoing', label: 'Đang diễn ra' },
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
];

export const FLORA_OPEN_EVENT = 'flourish:open-flora';

export function openFloraChat(options = {}) {
    window.dispatchEvent(new CustomEvent(FLORA_OPEN_EVENT, { detail: options }));
}

function pathMatchesPrefix(pathname, prefix) {
    if (prefix === '/tours') {
        return pathname === '/tours' || (pathname.startsWith('/tours/') && !pathname.startsWith('/tours/itinerary'));
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isExploreActive(pathname) {
    return (
        pathMatchesPrefix(pathname, '/destinations')
        || pathname === '/travel-guide'
        || pathMatchesPrefix(pathname, '/our-guides')
        || pathMatchesPrefix(pathname, '/news')
        || pathMatchesPrefix(pathname, '/stories')
        || pathMatchesPrefix(pathname, '/content')
        || pathname === '/my-vouchers'
    );
}

export function isTourNavActive(pathname) {
    return pathMatchesPrefix(pathname, '/tours');
}

export function isExperienceActive(pathname) {
    return pathMatchesPrefix(pathname, '/activities');
}

export function isMyTripsActive(pathname) {
    return pathname.startsWith('/my-journey') || pathname.startsWith('/chat/');
}

export function isNavGroupActive(pathname, groupId) {
    switch (groupId) {
        case 'explore':
            return isExploreActive(pathname);
        case 'tours':
            return isTourNavActive(pathname);
        case 'experience':
            return isExperienceActive(pathname);
        case 'my-trips':
            return isMyTripsActive(pathname);
        default:
            return false;
    }
}

/** Phân loại chuyến đi cho bộ lọc My Journey */
export function getTripFilterPhase(booking) {
    const st = (booking.bookingStatus || '').toLowerCase();
    if (st === 'cancelled') return 'cancelled';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (s) => {
        if (!s) return null;
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const start = parseDate(booking.sessionStartDate);
    const end = parseDate(booking.sessionEndDate) || start;

    if (start && end) {
        if (today > end) return 'completed';
        if (today >= start && today <= end) return 'ongoing';
        if (today < start) return 'upcoming';
    }

    if (st === 'completed') return 'completed';
    if (['paid', 'confirmed'].includes(st)) return 'upcoming';
    if (st === 'pending') return 'upcoming';
    return 'all';
}
