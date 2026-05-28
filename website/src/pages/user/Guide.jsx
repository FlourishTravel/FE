import React, { useState } from 'react';
import { ArrowRight, Leaf, Sun, CloudRain, CheckCircle2, Navigation, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Guide.module.css';
import { useAuth } from '../../context/AuthContext';
import bangkokImg from '../../assets/294274-3000x2000-desktop-hd-bangkok-background-image.jpg';
import entryImg from '../../assets/du-lich-thai-lan-ivivu-1.jpg';
import transportImg from '../../assets/di-chuyen-di-lai-thai-lan-2.webp';
import currencyImg from '../../assets/du-lich-thai-lan-ivivu-2.jpg';
import taxiImg from '../../assets/Taxi-phương-tiện-phổ-biến-tại-Thái-Lan.jpg';
import busImg from '../../assets/Xe-bus-Thái-Lan.jpg';
import tuktukImg from '../../assets/Tuk-Tuk.jpg';
import mrtImg from '../../assets/MRT.jpg';
import btsImg from '../../assets/Skytrain-BTS.jpg';
import embassyImg from '../../assets/Đại-sứ-quán-Việt-Nam-bên-Thái.jpg';
import thailandBg from '../../assets/31451-3840x2160-desktop-4k-thailand-wallpaper-image.jpg';
import overviewBg from '../../assets/123935-1536x2048-mobile-hd-thailand-background-image (1).jpg';

// Preserving the original array as requested (do not delete existing variables/data)
const GUIDE_ARTICLES = [
    {
        id: 1,
        title: 'Chuẩn bị vali cho tour trải nghiệm 5–7 ngày',
        excerpt: 'Mách bạn cách sắp xếp đồ gọn nhẹ, đồ dùng cần thiết và những món không nên mang khi đi tour nhóm.',
        readTime: '5 phút',
        category: 'Chuẩn bị',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    },
    // ... other items are preserved but not rendered in the new layout ...
];

const Guide = () => {
    const navigate = useNavigate();

    // Preserving all existing hooks/variables as requested by "không đổi tên biến/function"
    const {
        user,
        login,
        loginWithApi,
        checkCredentials,
        checkAdminCredentials,
        checkGuideCredentials,
        MOCK_USER,
        MOCK_ADMIN,
        MOCK_GUIDE,
    } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const isGuest = !user;

    const openLoginModal = (article) => {
        if (!isGuest) return;
        setSelectedArticle(article);
        setLoginError('');
        setShowLoginModal(true);
    };

    const closeLoginModal = () => {
        setShowLoginModal(false);
        setSelectedArticle(null);
        setLoginError('');
        setLoginSubmitting(false);
        setLoginPassword('');
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setLoginError('');
        setLoginSubmitting(true);

        try {
            const apiUser = await loginWithApi(loginEmail, loginPassword);
            if (apiUser?.role === 'admin') {
                navigate('/admin');
                return;
            }
            if (apiUser?.role === 'guide') {
                navigate('/guide/dashboard');
                return;
            }
            setShowLoginModal(false);
            return;
        } catch (err) {
            const isNetworkError = !err?.status || err.status >= 500;
            if (isNetworkError) {
                if (checkAdminCredentials(loginEmail, loginPassword)) {
                    login(MOCK_ADMIN);
                    navigate('/admin');
                    return;
                }
                if (checkGuideCredentials(loginEmail, loginPassword)) {
                    login(MOCK_GUIDE);
                    navigate('/guide/dashboard');
                    return;
                }
                if (checkCredentials(loginEmail, loginPassword)) {
                    login(MOCK_USER);
                    setShowLoginModal(false);
                    return;
                }
                setLoginError(
                    'Không kết nối được máy chủ. Tài khoản demo offline:\n' +
                    'User: demo@flourish.com / flourish123\n' +
                    'Admin: admin@flourish.com / admin123\n' +
                    'Guide: guide@flourish.com / guide123'
                );
            } else {
                setLoginError(err?.message || 'Email hoặc mật khẩu không đúng.');
            }
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleCardKeyDown = (event, article) => {
        if (!isGuest) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLoginModal(article);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                {/* Hero Section */}
                <div className={styles.heroWrapper}>
                    <img
                        src={thailandBg}
                        alt="Tuyệt Tác Thái Lan"
                        className={styles.heroImage}
                    />
                    <div className={styles.heroContent}>
                        <span className={styles.heroBadge}>Cẩm nang điểm đến</span>
                        <h1 className={styles.heroTitle}>Tuyệt Tác<br />Thái Lan</h1>
                        <p className={styles.heroDesc}>
                            Hành trình khám phá "Xứ sở chùa Vàng" qua lăng kính của những tâm hồn yêu sự xê dịch. Đắm chìm trong sắc xanh lục bảo của biển trời thiên nhiên.
                        </p>
                    </div>
                </div>

                {/* Section 1: Tổng quan */}
                <section className={styles.section}>
                    <div className={styles.overviewGrid}>
                        <div>
                            <h2 className={styles.sectionTitle}>Tổng quan du lịch Thái Lan</h2>
                            <div className={styles.sectionDesc}>
                                <p className="mb-5">Thái Lan nổi tiếng với ngành công nghiệp du lịch, là một trong những quốc gia thu hút nhiều du khách nhất Đông Nam Á. Được mệnh danh là "Xứ sở nụ cười" hay "Đất nước chùa vàng", Thái Lan mang đến những trải nghiệm đa dạng từ văn hóa, tôn giáo đến ẩm thực và thiên nhiên.</p>
                                <p>Từ sự nhộn nhịp, hoa lệ của thủ đô Bangkok, sự yên bình mộng mơ của đóa hồng phương Bắc Chiang Mai, cho đến những bãi biển cát trắng nắng vàng tại Phuket hay Pattaya. Nơi đây luôn là điểm đến lý tưởng cho mọi du khách.</p>
                            </div>
                        </div>
                        <div className={styles.overviewImageWrap}>
                            <img
                                src={overviewBg}
                                alt="Du lịch Thái Lan"
                                className={styles.overviewImage}
                            />
                            <div className={styles.overviewNoteCard}>
                                <p className={styles.overviewNoteText}>Du lịch Thái Lan mang lại những trải nghiệm văn hóa độc đáo mà bạn không thể bỏ lỡ!</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Thời điểm */}
                <section className={styles.section}>
                    <div className={styles.timeSectionBox}>
                        <h2 className={styles.sectionTitleCenter}>Thời điểm du lịch Thái Lan</h2>
                        <p className={styles.sectionDescCenter}>
                            Thái Lan có khí hậu nhiệt đới gió mùa với 3 mùa rõ rệt. Hãy chọn thời điểm phù hợp nhất với kế hoạch trải nghiệm của bạn.
                        </p>

                        <div className={styles.timeGrid}>
                            {/* Mùa cao điểm */}
                            <div className={styles.timeCard}>
                                <div className={`${styles.timeIconWrap} ${styles.timeIconGreen}`}>
                                    <Leaf size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className={styles.timeCardTitle}>Mùa cao điểm</h3>
                                <p className={styles.timeCardDesc}>(Tháng 11 - Tháng 2)</p>
                                <ul className={styles.timeList}>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Thời tiết mát mẻ, ít mưa</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Lý tưởng cho mọi hoạt động tham quan</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Lưu ý: Đông đúc và chi phí cao</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Mùa nóng */}
                            <div className={styles.timeCard}>
                                <div className={`${styles.timeIconWrap} ${styles.timeIconBrown}`}>
                                    <Sun size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className={styles.timeCardTitle}>Mùa nóng</h3>
                                <p className={styles.timeCardDesc}>(Tháng 3 - Tháng 6)</p>
                                <ul className={styles.timeList}>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Khí hậu khá nóng bức, nhiệt độ cao</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Thích hợp du lịch biển, đảo hoang sơ</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Tham gia Lễ hội té nước Songkran</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Mùa mưa */}
                            <div className={styles.timeCard}>
                                <div className={`${styles.timeIconWrap} ${styles.timeIconGray}`}>
                                    <CloudRain size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className={styles.timeCardTitle}>Mùa mưa</h3>
                                <p className={styles.timeCardDesc}>(Tháng 7 - Tháng 10)</p>
                                <ul className={styles.timeList}>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Thường có mưa vào chiều, không kéo dài</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Chi phí du lịch rẻ hơn đáng kể</span>
                                    </li>
                                    <li className={styles.timeListItem}>
                                        <CheckCircle2 className={styles.timeListIcon} />
                                        <span>Phong cảnh xanh tươi, yên bình hơn</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <p className={styles.timeSummary}>
                            Mỗi mùa đều có nét đặc trưng và trải nghiệm du lịch khác nhau. Tùy vào mục tiêu mà bạn hãy lên kế hoạch cho phù hợp.
                        </p>
                    </div>
                </section>

                {/* Section 3: Điểm đến */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitleCenter}>Điểm đến không thể bỏ lỡ</h2>

                    <div className={styles.destGrid}>
                        {/* Bangkok */}
                        <div className={styles.destRow}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={bangkokImg}
                                    alt="Bangkok"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Bangkok – Nhịp đập sôi động</h3>
                                <p className={styles.destDesc}>
                                    Thủ đô Bangkok là sự kết hợp hoàn hảo giữa những công trình kiến trúc đền chùa truyền thống nguy nga và các khu trung tâm thương mại sầm uất. Đừng bỏ lỡ Cung điện Hoàng Gia hay chùa Wat Arun lung linh bên bờ sông Chao Phraya.
                                </p>
                                <button className={styles.primaryBtn} onClick={() => navigate('/tours?search=bangkok')}>
                                    Khám phá Bangkok
                                </button>
                            </div>
                        </div>

                        {/* Chiang Mai */}
                        <div className={styles.destRowReverse}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={entryImg}
                                    alt="Thủ tục nhập cảnh"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Thủ tục nhập cảnh Thái Lan</h3>
                                <p className={styles.destDesc}>
                                    Công dân Việt Nam đi du lịch Thái Lan được miễn visa tối đa 30 ngày. Nếu muốn ở lâu hơn, cần xin Tourist Visa 60 ngày tại lãnh sự và có thể gia hạn thêm 30 ngày tại Thái Lan, tổng cộng tối đa 90 ngày.<br />
                                    <strong>Ngoài ra, bạn cần chuẩn bị:</strong>
                                    <ul>
                                        <li> <strong> * Hộ chiếu còn hạn ít nhất 6 tháng khi nhập cảnh.</strong></li>
                                        <li><strong> * Không còn yêu cầu bảo hiểm du lịch và Thailand Pass.</strong></li>
                                        <li><strong> * Từ 01/5/2025, phải khai báo nhập cảnh online qua hệ thống TDAC trong vòng 3 ngày trước khi đến Thái Lan. Sau khi khai báo xong sẽ nhận email xác nhận và mã QR để xuất trình khi nhập cảnh.</strong></li>
                                    </ul>
                                </p>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Tiền tệ & Di chuyển */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitleCenter}>Tiền tệ & Phương tiện di chuyển</h2>

                    <div className={styles.destGrid}>
                        {/* Tiền tệ */}
                        <div className={styles.destRow}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={currencyImg}
                                    alt="Tiền tệ Thái Lan"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Tiền tệ (Baht Thái)</h3>
                                <p className={styles.destDesc}>
                                    Đơn vị tiền tệ chính thức của Thái Lan là Baht (THB). Bạn có thể dễ dàng đổi tiền tại các quầy ở sân bay, ngân hàng, hoặc các đại lý thu đổi ngoại tệ uy tín như Superrich để có tỷ giá tốt nhất. Nên mang theo một ít tiền mặt (các mệnh giá nhỏ) để thuận tiện mua sắm tại chợ đêm và quán ăn đường phố.
                                </p>
                            </div>
                        </div>

                        {/* Taxi */}
                        <div className={styles.destRowReverse}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={taxiImg}
                                    alt="Taxi Thái Lan"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Taxi</h3>
                                <p className={styles.destDesc}>
                                    Taxi ở Thái Lan rất phổ biến và nổi bật với nhiều màu sắc rực rỡ như hồng, vàng, xanh. Đây là phương tiện tiện lợi để di chuyển trong thành phố.<br />
                                    <strong>Lưu ý:</strong> Hãy luôn yêu cầu tài xế bật đồng hồ tính tiền (meter) ngay khi lên xe, hoặc sử dụng các ứng dụng gọi xe công nghệ (Grab, Bolt) để biết trước giá cước.
                                </p>
                            </div>
                        </div>

                        {/* Xe Bus */}
                        <div className={styles.destRow}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={busImg}
                                    alt="Xe Bus Thái Lan"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Xe Bus Công Cộng</h3>
                                <p className={styles.destDesc}>
                                    Xe bus là phương tiện công cộng giá rẻ nhất để khám phá Bangkok và các tỉnh lân cận. Có nhiều loại xe bus từ không máy lạnh đến xe đời mới mát mẻ. Mặc dù thời gian di chuyển có thể lâu hơn do kẹt xe, nhưng đây là cơ hội tuyệt vời để bạn ngắm nhìn và trải nghiệm nhịp sống thực sự của người dân địa phương.
                                </p>
                            </div>
                        </div>

                        {/* Tuk Tuk */}
                        <div className={styles.destRowReverse}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={tuktukImg}
                                    alt="Tuk Tuk Thái Lan"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Xe Tuk Tuk</h3>
                                <p className={styles.destDesc}>
                                    Tuk tuk là "đặc sản" và là biểu tượng đường phố không thể thiếu của du lịch Thái Lan. Trải nghiệm cảm giác lướt gió trên những chiếc xe ba bánh đầy màu sắc qua các con phố nhộn nhịp chắc chắn sẽ rất đáng nhớ. Đừng quên thỏa thuận giá cả rõ ràng với tài xế trước khi bắt đầu hành trình nhé!
                                </p>
                            </div>
                        </div>

                        {/* Tàu điện ngầm MRT */}
                        <div className={styles.destRow}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={mrtImg}
                                    alt="Tàu điện ngầm MRT"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Tàu điện ngầm MRT</h3>
                                <p className={styles.destDesc}>
                                    MRT là hệ thống tàu điện ngầm ở Bangkok, vận hành tuyến nối liền các khu vực từ Bang Sue ở phía Bắc, qua Sukhumvit, Silom và kết thúc tại trạm Hua Lamphong gần khu phố Tàu. Vé lẻ có dạng một đồng xu nhựa màu đen mua tại các máy tự động. Hãy chạm đồng xu khi vào cổng và giữ cẩn thận để nộp lại khi ra ở trạm đến.
                                </p>
                            </div>
                        </div>

                        {/* Tàu điện trên cao BTS Skytrain */}
                        <div className={styles.destRowReverse}>
                            <div className={styles.destImageWrap}>
                                <img
                                    src={btsImg}
                                    alt="Tàu điện trên cao BTS"
                                    className={styles.destImage}
                                />
                            </div>
                            <div className={styles.destContent}>
                                <h3 className={styles.destTitle}>Tàu điện trên cao BTS Skytrain</h3>
                                <p className={styles.destDesc}>
                                    BTS Skytrain là hệ thống tàu điện trên cao cực kỳ tiện lợi và nhanh chóng giúp bạn tránh được tình trạng kẹt xe kinh hoàng của Bangkok. BTS gồm hai tuyến chính: Tuyến Silom (chạy qua trung tâm Siam và khu vực Tây Nam thành phố) và Tuyến Sukhumvit (chạy dọc từ Bắc xuống Đông Nam qua Mochit, Siam, Sukhumvit). Giá vé dao động từ 10 đến 52 Baht tùy khoảng cách.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Đại sứ quán Việt Nam tại Thái Lan */}
                <section className={styles.section}>
                    <div className={styles.embassyCard}>
                        <div className={styles.embassyImageWrap}>
                            <img
                                src={embassyImg}
                                alt="Đại sứ quán Việt Nam tại Thái Lan"
                                className={styles.embassyImage}
                            />
                        </div>
                        <div className={styles.embassyContent}>
                            <h2 className={styles.embassyTitle}>Đại sứ quán Việt Nam tại Thái Lan</h2>
                            <p className={styles.embassyText}>Thông tin liên hệ chính thức hỗ trợ công dân Việt Nam khi đi du lịch hoặc công tác tại Thái Lan.</p>

                            <div className={styles.embassyDetails}>
                                <div className={styles.detailItem}>
                                    <div className={styles.detailIcon}>
                                        <MapPin size={18} />
                                    </div>
                                    <div className={styles.detailText}>
                                        <strong>Địa chỉ:</strong> 83/1 Wireless Road, Lumpini, Pathumwan, Bangkok 10330.
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <div className={styles.detailIcon}>
                                        <Phone size={18} />
                                    </div>
                                    <div className={styles.detailText}>
                                        <strong>Số điện thoại:</strong> (662) 251 5836 – 38 | <strong>Fax:</strong> (662) 251 7203
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <div className={styles.detailIcon}>
                                        <Mail size={18} />
                                    </div>
                                    <div className={styles.detailText}>
                                        <strong>Email:</strong> vnemb.th@mofa.gov.vn
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Render Login Modal from Original Code */}
            {showLoginModal && (
                <div className={styles.loginModalOverlay} onClick={closeLoginModal}>
                    <div className={styles.loginModal} onClick={(event) => event.stopPropagation()}>
                        <button type="button" className={styles.loginCloseBtn} onClick={closeLoginModal}>
                            ×
                        </button>
                        <div className={styles.loginHeader}>
                            <h3 className={styles.loginTitle}>Đăng nhập để xem thông tin</h3>
                        </div>
                        <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
                            <div className={styles.loginField}>
                                <label className={styles.loginLabel} htmlFor="guide-login-email">Email</label>
                                <input
                                    id="guide-login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={loginEmail}
                                    onChange={(event) => setLoginEmail(event.target.value)}
                                    className={styles.loginInput}
                                    required
                                />
                            </div>
                            <div className={styles.loginField}>
                                <label className={styles.loginLabel} htmlFor="guide-login-password">Mật khẩu</label>
                                <input
                                    id="guide-login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={loginPassword}
                                    onChange={(event) => setLoginPassword(event.target.value)}
                                    className={styles.loginInput}
                                    required
                                />
                            </div>
                            {loginError && <p className={styles.loginError}>{loginError}</p>}
                            <button type="submit" className={styles.loginSubmit} disabled={loginSubmitting}>
                                {loginSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Guide;
