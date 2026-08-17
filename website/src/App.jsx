import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import FeaturedPromotions from './components/FeaturedPromotions';
import FeaturedReviews from './components/FeaturedReviews';
import ValueProp from './components/ValueProp';
import Mission from './components/Mission';
import UserBottomNav from './components/UserBottomNav';
import Footer from './components/Footer';
import FloatingChatbot from './components/FloatingChatbot';
import ScrollToTop from './components/ScrollToTop';

// Import pages
import Help from './pages/user/Help';
import PrivacySettings from './pages/user/PrivacySettings';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import CookiePolicy from './pages/user/CookiePolicy';
import PrivacyPolicy from './pages/user/PrivacyPolicy';
import TermsOfService from './pages/user/TermsOfService';
import CompanyDetails from './pages/user/CompanyDetails';
import TourListing from './pages/user/TourListing';
import TourDetail from './pages/user/TourDetail';
import MyJourney from './pages/user/MyJourney';
import BookingDetail from './pages/user/BookingDetail';
import Destinations from './pages/user/Destinations';
import Guide from './pages/user/Guide';
import OurGuides from './pages/user/OurGuides';
import GuideDetail from './pages/user/GuideDetail';
import About from './pages/user/About';
import DownloadApp from './pages/user/DownloadApp';
import Careers from './pages/user/Careers';
import News from './pages/user/News';
import Stories from './pages/user/Stories';
import Profile from './pages/user/Profile';
import Checkout from './pages/user/Checkout';
import CheckoutPaymentResult from './pages/user/CheckoutPaymentResult';
import GroupChat from './pages/user/GroupChat';
import CancellationPolicy from './pages/user/CancellationPolicy';
import Notifications from './pages/user/Notifications';
import Activities from './pages/user/Activities';
import ContentDetail from './pages/user/ContentDetail';
import MyWallet from './pages/user/MyWallet';
import MyVouchers from './pages/user/MyVouchers';
import MyReviews from './pages/user/MyReviews';
import MyPoints from './pages/user/MyPoints';
import DestinationDetail from './pages/user/DestinationDetail';
import TicketDetail from './pages/user/TicketDetail';
import { useAuth } from './context/AuthContext';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedAdminRoute from './pages/admin/components/ProtectedAdminRoute';
import Dashboard from './pages/admin/pages/Dashboard';
import TourManagement from './pages/admin/pages/TourManagement';
import CategoryManagement from './pages/admin/pages/CategoryManagement';
import TourItineraryBuilder from './pages/admin/pages/TourItineraryBuilder';
import TourDispatch from './pages/admin/pages/TourDispatch';
import BookingManagement from './pages/admin/pages/BookingManagement';
import CustomerManagement from './pages/admin/pages/CustomerManagement';
import FinancialManagement from './pages/admin/pages/FinancialManagement';
import StaffManagement from './pages/admin/pages/StaffManagement';
import PromotionManagement from './pages/admin/pages/PromotionManagement';
import ContactRequestManagement from './pages/admin/pages/ContactRequestManagement';
import CatalogTicketManagement from './pages/admin/pages/CatalogTicketManagement';
import NotificationBroadcast from './pages/admin/pages/NotificationBroadcast';
import ReviewModeration from './pages/admin/pages/ReviewModeration';
import GuideProfiles from './pages/admin/pages/GuideProfiles';
import ContentManagement from './pages/admin/pages/ContentManagement';
import AdminSettings from './pages/admin/pages/AdminSettings';
import GuideExpenseManagement from './pages/admin/pages/GuideExpenseManagement';
import DestinationManagement from './pages/admin/pages/DestinationManagement';

// Guide imports
import GuideLayout from './pages/guide/GuideLayout';
import ProtectedGuideRoute from './pages/guide/components/ProtectedGuideRoute';
import GuideDashboard from './pages/guide/pages/GuideDashboard';
import GuideTourList from './pages/guide/pages/GuideTourList';
import GuideTourDetail from './pages/guide/pages/GuideTourDetail';
import GuideGuestManagement from './pages/guide/pages/GuideGuestManagement';
import GuideCommunication from './pages/guide/pages/GuideCommunication';
import GuideOperations from './pages/guide/pages/GuideOperations';
import GuideExpenses from './pages/guide/pages/GuideExpenses';
import GuideProfile from './pages/guide/pages/GuideProfile';

// Home page component (inline)
const HomePage = () => (
  <div className="min-h-screen w-full">
    <Navbar />
    <Hero />
    <FeaturedPromotions />
    <FeaturedDestinations />
    <FeaturedReviews />
    <ValueProp />
    <Mission />
    <Footer />
  </div>
);

function FloraGlobalAssistant() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/guide')
    || location.pathname.startsWith('/chat/')) {
    return null;
  }
  return <FloatingChatbot pageSource="flora-web" />;
}

function App() {
  const { user } = useAuth();
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/download" element={<><Navbar /><DownloadApp /><Footer /></>} />
        <Route path="/help" element={<><Navbar /><Help /><Footer /></>} />
        <Route path="/privacy-settings" element={<><Navbar /><PrivacySettings /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /><Footer /></>} />
        <Route path="/my-journey" element={<><Navbar /><MyJourney /><Footer /></>} />
        <Route path="/my-wallet" element={user ? <><Navbar /><MyWallet /><Footer /></> : <Navigate to="/login" replace />} />
        <Route path="/my-vouchers" element={<><Navbar /><MyVouchers /><Footer /></>} />
        <Route path="/my-reviews" element={user ? <><Navbar /><MyReviews /><Footer /></> : <Navigate to="/login" replace />} />
        <Route path="/my-points" element={user ? <><Navbar /><MyPoints /><Footer /></> : <Navigate to="/login" replace />} />
        <Route path="/my-journey/booking/:bookingId" element={<><Navbar /><BookingDetail /><Footer /></>} />
        <Route path="/destinations" element={<><Navbar /><Destinations /><Footer /></>} />
        <Route path="/destinations/:slug" element={<><Navbar /><DestinationDetail /><Footer /></>} />
        <Route path="/travel-guide" element={<><Navbar /><Guide /><Footer /></>} />
        <Route path="/our-guides" element={<><Navbar /><OurGuides /><Footer /></>} />
        <Route path="/our-guides/:id" element={<><Navbar /><GuideDetail /><Footer /></>} />
        <Route path="/notifications" element={user ? <><Navbar /><Notifications /><Footer /></> : <Navigate to="/login" replace />} />
        <Route path="/tours" element={<><Navbar /><TourListing /><Footer /></>} />
        <Route path="/activities" element={<><Navbar /><Activities /><Footer /></>} />
        <Route path="/activities/:slug" element={<><Navbar /><TicketDetail /><Footer /></>} />
        <Route path="/tours/:id" element={<><Navbar /><TourDetail /><Footer /></>} />
        <Route path="/checkout/result" element={<><Navbar /><CheckoutPaymentResult /><Footer /></>} />
        <Route path="/checkout/:tourId" element={<><Navbar /><Checkout /><Footer /></>} />
        <Route path="/chat/:bookingId" element={<><Navbar /><GroupChat /></>} />
        <Route path="/cookie-policy" element={<><Navbar /><CookiePolicy /><Footer /></>} />
        <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
        <Route path="/terms-of-service" element={<><Navbar /><TermsOfService /><Footer /></>} />
        <Route path="/company-details" element={<><Navbar /><CompanyDetails /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/careers" element={<><Navbar /><Careers /><Footer /></>} />
        <Route path="/news" element={<><Navbar /><News /><Footer /></>} />
        <Route path="/stories" element={<><Navbar /><Stories /><Footer /></>} />
        <Route path="/content/:slug" element={<><Navbar /><ContentDetail /><Footer /></>} />
        <Route path="/cancellation-policy" element={<><Navbar /><CancellationPolicy /><Footer /></>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tours" element={<TourManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="contact-requests" element={<ContactRequestManagement />} />
          <Route path="catalog-tickets" element={<CatalogTicketManagement />} />
          <Route path="destinations" element={<DestinationManagement />} />
          <Route path="notifications" element={<NotificationBroadcast />} />
          <Route path="reviews" element={<ReviewModeration />} />
          <Route path="guide-profiles" element={<GuideProfiles />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="tours/itinerary/:tourId" element={<TourItineraryBuilder />} />
          <Route path="dispatch" element={<TourDispatch />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="financials" element={<FinancialManagement />} />
          <Route path="guide-expenses" element={<GuideExpenseManagement />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>

        {/* Guide Routes */}
        <Route path="/guide/*" element={<ProtectedGuideRoute><GuideLayout /></ProtectedGuideRoute>}>
          <Route path="dashboard" element={<GuideDashboard />} />
          <Route path="tours" element={<GuideTourList />} />
          <Route path="tours/:tourId" element={<GuideTourDetail />} />
          <Route path="guests" element={<GuideGuestManagement />} />
          <Route path="communication" element={<GuideCommunication />} />
          <Route path="operations" element={<GuideOperations />} />
          <Route path="expenses" element={<GuideExpenses />} />
          <Route path="profile" element={<GuideProfile />} />
          <Route path="settings" element={<GuideProfile />} />
        </Route>
      </Routes>
      <FloraGlobalAssistant />
      <UserBottomNav />
    </>
  );
}

export default App;

