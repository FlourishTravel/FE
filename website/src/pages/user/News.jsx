import React, { useState } from 'react';
import { Calendar, X, Clock, ArrowRight } from 'lucide-react';
import styles from './News.module.css';

const NEWS_ITEMS = [
    {
        id: 1,
        title: 'Hành trình vị giác: Lớp học nấu ăn bản địa giữa thung lũng Chiang Mai',
        date: '05/06/2026',
        category: 'Ẩm thực',
        readTime: '4 phút đọc',
        excerpt: 'Flourish Travel giới thiệu tour ẩm thực độc bản tại Chiang Mai, kết hợp tự tay thu hoạch rau hữu cơ và học nấu 5 món đặc sản Bắc Thái.',
        content: `Chiang Mai không chỉ nổi tiếng với những ngôi chùa cổ kính mà còn là cái nôi của ẩm thực Lanna độc đáo. Để giúp du khách chạm sâu hơn vào văn hóa bản địa, Flourish Travel vừa ra mắt tour trải nghiệm “Hành trình vị giác Bắc Thái”.\n\nĐiểm nhấn của tour là một ngày làm nông dân thực thụ tại nông trại hữu cơ hữu tình nằm cách trung tâm Chiang Mai 20km. Tại đây, du khách sẽ được hướng dẫn tự tay thu hái các loại thảo mộc, gia vị đặc trưng như lá chanh Kaffir, sả, riềng và ớt hiểm.\n\nSau buổi thu hoạch, bếp trưởng Somchai – nghệ nhân ẩm thực với hơn 20 năm kinh nghiệm – sẽ hướng dẫn du khách chế biến các món ăn kinh điển: cà ri Khao Soy trứ danh, gỏi miến lạp Lanna, Pad Thai kiểu Bắc và xôi xoài nước cốt dừa béo ngậy. Trải nghiệm khép lại bằng bữa trưa ấm cúng giữa thung lũng lộng gió, nơi mọi người cùng thưởng thức thành quả của chính mình.\n\nTour ẩm thực này hiện được tổ chức hàng ngày với quy mô nhỏ (tối đa 8 khách/đoàn) để đảm bảo tính tương tác cao nhất.`,
        image: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=800&q=80',
    },
    {
        id: 2,
        title: 'Trekking Doi Inthanon: Băng rừng xanh và ngủ đêm bản người Karen',
        date: '01/06/2026',
        category: 'Khám phá',
        readTime: '5 phút đọc',
        excerpt: 'Chuyến phiêu lưu khám phá nóc nhà Thái Lan Doi Inthanon, trekking qua những dòng thác kỳ vĩ và lưu trú tại bản người Dao Karen.',
        content: `Dành cho những tâm hồn đam mê xê dịch và muốn hòa mình vào thiên nhiên hoang sơ, tour trekking Doi Inthanon của Flourish Travel mở ra một hành trình hoàn toàn khác biệt tại miền Bắc Thái Lan.\n\nBắt đầu từ sáng sớm, cung đường trekking dài 8km sẽ đưa bạn đi xuyên qua thảm thực vật nhiệt đới rậm rạp của Vườn quốc gia Doi Inthanon, ngắm nhìn thác nước Pha Dok Siew đổ xuống từ vách đá thẳng đứng. Dưới sự dẫn dắt của một hướng dẫn viên bản địa người Karen, bạn sẽ được nghe kể về hệ sinh thái đặc hữu và những câu chuyện truyền thuyết của rừng sâu.\n\nĐặc biệt, du khách sẽ ngủ đêm tại bản Baan Mae Klang Luang của người Karen. Tại đây, bạn sẽ cùng người dân rang xay hạt cà phê Arabica thủ công bên bếp củi hồng, thưởng thức bữa tối giản dị nấu từ sản vật địa phương và lắng nghe những giai điệu nhạc cụ truyền thống. Hành trình này không chỉ mang lại trải nghiệm phiêu lưu mà còn đóng góp trực tiếp vào nguồn thu nhập bền vững cho cộng đồng dân tộc vùng cao Thái Lan.`,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    },
    {
        id: 3,
        title: 'Koh Kood: Thiên đường biển ẩn giấu của miền Đông Thái Lan',
        date: '28/05/2026',
        category: 'Nghỉ dưỡng',
        readTime: '4 phút đọc',
        excerpt: 'Tránh xa sự ồn ào của Bangkok, Koh Kood vẫy gọi với những bãi cát trắng mịn màng như bột và làn nước trong vắt nhìn thấy đáy.',
        content: `Nằm sát biên giới biển phía Đông Thái Lan, Koh Kood được mệnh danh là hòn đảo hoang sơ cuối cùng chưa bị thương mại hóa đại trà. Flourish Travel mang đến hành trình nghỉ dưỡng xanh 4 ngày 3 đêm tại hòn đảo xinh đẹp này.\n\nTrải nghiệm bắt đầu từ việc di chuyển bằng tàu cao tốc từ Trat ra đảo. Koh Kood chào đón du khách bằng những rặng dừa nghiêng bóng bên bãi biển Klong Chao trong vắt. Tại đây, bạn có thể tự do chèo thuyền kayak dọc theo rừng ngập mặn tĩnh lặng, lặn ngắm những rạn san hô nguyên vẹn tại hòn đảo lân cận Koh Rang, hoặc trekking ngắn xuyên rừng tìm đến dòng thác Klong Chao mát lạnh.\n\nVới tiêu chí du lịch có trách nhiệm, Flourish Travel hợp tác với các resort sử dụng năng lượng mặt trời, hạn chế tối đa rác thải nhựa và phục vụ nguồn hải sản đánh bắt trong ngày bởi ngư dân địa phương. Một chuyến đi tái tạo năng lượng hoàn hảo cho những ai yêu biển và sự yên tĩnh tuyệt đối.`,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
        id: 4,
        title: 'Ayutthaya huyền bí: Tour du thuyền hoàng hôn và thiền định cổ tự',
        date: '20/05/2026',
        category: 'Văn hóa',
        readTime: '4 phút đọc',
        excerpt: 'Ngược dòng lịch sử tìm về cố đô Ayutthaya cổ kính, lắng lòng bên buổi thiền chiều và ngắm cảnh hoàng hôn rực rỡ từ du thuyền gỗ.',
        content: `Cố đô Ayutthaya - di sản văn hóa thế giới được UNESCO công nhận - luôn ẩn chứa một vẻ đẹp trầm mặc đầy cuốn hút. Tour chuyên đề văn hóa lịch sử mới của Flourish Travel sẽ mang đến một góc nhìn hoàn toàn mới lạ.\n\nBuổi sáng, du khách sẽ ghé thăm các ngôi đền biểu tượng như Wat Mahathat (nơi có đầu tượng Phật trong rễ cây cổ thụ cổ kính) và Wat Chaiwatthanaram uy nghiêm bên bờ sông. Tại một góc thiền yin tĩnh trong khuôn viên chùa cổ, du khách sẽ được tham gia một buổi thiền định ngắn kéo dài 30 phút dưới sự hướng dẫn của thiền sư địa phương, giúp xua tan căng thẳng và tìm lại sự bình yên trong tâm hồn.\n\nKhi chiều buông, du khách sẽ bước lên chiếc du thuyền gỗ truyền thống, xuôi dòng sông Chao Phraya bao quanh cố đô. Vừa thưởng thức các món ăn cung đình Thái Lan tinh tế, bạn vừa ngắm nhìn những ngọn tháp cổ kính phát sáng lung linh dưới ánh hoàng hôn vàng ruộm. Đây là trải nghiệm kết hợp tuyệt vời giữa lịch sử, tâm linh và nghệ thuật ẩm thực.`,
        image: 'https://images.unsplash.com/photo-1564507592937-25994a9015b2?w=800&q=80',
    },
];

const News = () => {
    const [selectedNews, setSelectedNews] = useState(null);

    // Close modal on Escape key press
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedNews(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (selectedNews) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedNews]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tin tức & Báo chí</h1>
                <p className={styles.subtitle}>
                    Cập nhật về hành trình tour du lịch Thái Lan đặc sắc, các hoạt động bản địa và tin tức mới nhất từ Flourish Travel.
                </p>
            </div>
            <div className={styles.container}>
                <div className={styles.newsList}>
                    {NEWS_ITEMS.map((item) => (
                        <article 
                            key={item.id} 
                            className={styles.newsCard} 
                            onClick={() => setSelectedNews(item)}
                        >
                            <img src={item.image} alt={item.title} className={styles.newsImage} />
                            <div className={styles.newsContent}>
                                <div className={styles.newsMetaHeader}>
                                    <span className={styles.newsCategory}>{item.category}</span>
                                    <span className={styles.newsDate}>
                                        <Calendar className={styles.dateIcon} />
                                        {item.date}
                                    </span>
                                </div>
                                <h2 className={styles.newsTitle}>{item.title}</h2>
                                <p className={styles.newsExcerpt}>{item.excerpt}</p>
                                <span className={styles.readMore}>
                                    Đọc bài viết <ArrowRight size={14} />
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* News Detail Popup Modal */}
            {selectedNews && (
                <div className={styles.modalOverlay} onClick={() => setSelectedNews(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            className={styles.closeBtn} 
                            onClick={() => setSelectedNews(null)}
                            aria-label="Đóng"
                        >
                            <X size={20} />
                        </button>
                        <div className={styles.modalImageWrapper}>
                            <img src={selectedNews.image} alt={selectedNews.title} className={styles.modalImage} />
                            <span className={styles.modalTag}>{selectedNews.category}</span>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalMeta}>
                                <span className={styles.modalMetaItem}>
                                    <Calendar size={14} /> {selectedNews.date}
                                </span>
                                <span className={styles.modalMetaDivider}>•</span>
                                <span className={styles.modalMetaItem}>
                                    <Clock size={14} /> {selectedNews.readTime}
                                </span>
                            </div>
                            <h2 className={styles.modalTitle}>{selectedNews.title}</h2>
                            <div className={styles.modalText}>
                                {selectedNews.content.split('\n\n').map((para, index) => (
                                    <p key={index} className={styles.modalParagraph}>{para}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
