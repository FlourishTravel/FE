import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Help.module.css';
import { submitContact } from '../../api/contact';
import { listSiteContent } from '../../api/content';
import {
    FaPlane,
    FaFileAlt,
    FaMapMarkerAlt,
    FaCreditCard,
    FaSearch,
    FaEnvelope,
    FaComments,
    FaPhone,
    FaUsers
} from 'react-icons/fa';

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        fullName: '',
        email: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSuccess, setContactSuccess] = useState('');
    const [contactError, setContactError] = useState('');
    const [helpArticles, setHelpArticles] = useState([]);

    useEffect(() => {
        listSiteContent('help')
            .then((rows) => setHelpArticles(Array.isArray(rows) ? rows : []))
            .catch(() => setHelpArticles([]));
    }, []);

    const categories = [
        {
            icon: <FaPlane />,
            title: 'Booking Flights',
            description: 'Changing dates, baggage allowance, and student discounts.',
            articles: 12,
            color: 'yellow'
        },
        {
            icon: <FaFileAlt />,
            title: 'Visa Support',
            description: 'Application guides, embassy contacts, and document checklists.',
            articles: 8,
            color: 'green'
        },
        {
            icon: <FaMapMarkerAlt />,
            title: 'Student Travel Tips',
            description: 'Budgeting hacks, solo travel safety, and scholarship alerts.',
            articles: 24,
            color: 'yellowGreen'
        },
        {
            icon: <FaCreditCard />,
            title: 'Account & Billing',
            description: 'Update profile, payment methods, and subscription management.',
            articles: 5,
            color: 'yellowLight'
        }
    ];

    const popularArticles = helpArticles.length > 0
        ? helpArticles.map((a) => ({
            title: a.title,
            updated: a.category || 'Bài viết trợ giúp',
            slug: a.slug,
            body: a.summary || a.body,
        }))
        : [
        {
            title: 'Cách đặt tour trên Flourish',
            updated: 'Đặt tour',
        },
        {
            title: 'Chính sách hủy và hoàn tiền',
            updated: 'Thanh toán',
        },
        {
            title: 'Chat đoàn và liên lạc HDV',
            updated: 'Trong tour',
        },
    ];

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        setContactError('');
        setContactSuccess('');
        try {
            await submitContact({
                fullName: contactForm.fullName.trim(),
                email: contactForm.email.trim(),
                message: contactForm.message.trim(),
            });
            setContactSuccess('Đã gửi liên hệ thành công. Đội ngũ sẽ phản hồi sớm.');
            setContactForm({ fullName: '', email: '', message: '' });
        } catch (err) {
            setContactError(err.message || 'Không thể gửi liên hệ. Vui lòng thử lại.');
        } finally {
            setContactLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>How can we help you flourish?</h1>
                    <p className={styles.heroSubtitle}>
                        Find answers about student travel hacks, scholarship alerts, visa processes,<br />
                        and destination guides.
                    </p>

                    <div className={styles.searchContainer}>
                        <div className={styles.searchWrapper}>
                            <input
                                type="text"
                                placeholder="Search for articles, guides, or troubleshooting..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <button className={styles.searchButton}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Left Content */}
                <div className={styles.leftContent}>
                    {/* Browse by Category */}
                    <div className={styles.categoriesSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.headerLine}></span>
                            <h2 className={styles.sectionTitle}>Browse by Category</h2>
                        </div>

                        <div className={styles.categoriesGrid}>
                            {categories.map((category, index) => (
                                <div key={index} className={`${styles.categoryCard} ${styles[category.color]}`}>
                                    <div className={styles.categoryIcon}>
                                        {category.icon}
                                    </div>
                                    <h3 className={styles.categoryTitle}>{category.title}</h3>
                                    <p className={styles.categoryDescription}>{category.description}</p>
                                    <Link to="#" className={styles.categoryLink}>
                                        View {category.articles} Articles →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Articles */}
                    <div className={styles.articlesSection}>
                        <h2 className={styles.articlesTitle}>Popular Articles</h2>
                        <div className={styles.articlesList}>
                            {popularArticles.map((article, index) => {
                                const inner = (
                                    <>
                                        <div className={styles.articleIcon}>
                                            <FaFileAlt />
                                        </div>
                                        <div className={styles.articleContent}>
                                            <h4 className={styles.articleTitle}>{article.title}</h4>
                                            <span className={styles.articleDate}>{article.updated}</span>
                                        </div>
                                    </>
                                );
                                return article.slug ? (
                                    <Link key={article.slug} to={`/content/${article.slug}`} className={styles.articleItem}>
                                        {inner}
                                    </Link>
                                ) : (
                                    <div key={index} className={styles.articleItem}>
                                        {inner}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className={styles.rightSidebar}>
                    {/* Still need help card */}
                    <div className={styles.helpCard}>
                        <h3 className={styles.helpCardTitle}>Still need help?</h3>
                        <p className={styles.helpCardDesc}>
                            Our support team is available 24/7 to assist you with your journey.
                        </p>

                        <div className={styles.contactOptions}>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <FaEnvelope />
                                </div>
                                <div className={styles.contactInfo}>
                                    <span className={styles.contactLabel}>EMAIL SUPPORT</span>
                                    <span className={styles.contactValue}>support@flourish.travel</span>
                                </div>
                            </div>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <FaComments />
                                </div>
                                <div className={styles.contactInfo}>
                                    <span className={styles.contactLabel}>LIVE CHAT</span>
                                    <span className={styles.contactValue}>Start a conversation</span>
                                </div>
                            </div>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <FaPhone />
                                </div>
                                <div className={styles.contactInfo}>
                                    <span className={styles.contactLabel}>HOTLINE</span>
                                    <span className={styles.contactValue}>+1 (800) 123-4567</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Join the Community card */}
                    <div className={styles.communityCard}>
                        <div className={styles.communityIcon}>
                            <FaUsers />
                        </div>
                        <h3 className={styles.communityTitle}>Join the Community</h3>
                        <p className={styles.communityDesc}>
                            Connect with thousands of student travelers sharing their experiences.
                        </p>
                        <button className={styles.communityButton}>
                            Join Forum
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contactFormSection}>
                <h2 className={styles.contactFormTitle}>Gửi yêu cầu hỗ trợ</h2>
                <p className={styles.contactFormSubtitle}>Nếu chưa tìm thấy câu trả lời, hãy để lại thông tin cho chúng tôi.</p>
                <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                    <input
                        className={styles.contactInput}
                        type="text"
                        placeholder="Họ và tên"
                        value={contactForm.fullName}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                    />
                    <input
                        className={styles.contactInput}
                        type="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                    />
                    <textarea
                        className={styles.contactTextarea}
                        placeholder="Nội dung cần hỗ trợ"
                        value={contactForm.message}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        required
                    />
                    <button type="submit" className={styles.contactSubmitBtn} disabled={contactLoading}>
                        {contactLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                    {contactSuccess ? <p className={styles.contactSuccess}>{contactSuccess}</p> : null}
                    {contactError ? <p className={styles.contactError}>{contactError}</p> : null}
                </form>
            </div>
        </div>
    );
};

export default Help;
