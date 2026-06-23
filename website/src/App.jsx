import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import ValueProp from './components/ValueProp';
import Mission from './components/Mission';
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
import About from './pages/user/About';
import Careers from './pages/user/Careers';
import News from './pages/user/News';
import Stories from './pages/user/Stories';
import Profile from './pages/user/Profile';
import Checkout from './pages/user/Checkout';
import CheckoutPaymentResult from './pages/user/CheckoutPaymentResult';
import GroupChat from './pages/user/GroupChat';
import CancellationPolicy from './pages/user/CancellationPolicy';

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

// Home page component (inline)
const HomePage = () => (
  <div className="min-h-screen w-full">
    <Navbar />
    <Hero />
    <FeaturedDestinations />
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
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/help" element={<><Navbar /><Help /><Footer /></>} />
        <Route path="/privacy-settings" element={<><Navbar /><PrivacySettings /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /><Footer /></>} />
        <Route path="/my-journey" element={<><Navbar /><MyJourney /><Footer /></>} />
        <Route path="/my-journey/booking/:bookingId" element={<><Navbar /><BookingDetail /><Footer /></>} />
        <Route path="/destinations" element={<><Navbar /><Destinations /><Footer /></>} />
        <Route path="/guide" element={<><Navbar /><Guide /><Footer /></>} />
        <Route path="/our-guides" element={<><Navbar /><Guide /><Footer /></>} />
        <Route path="/tours" element={<><Navbar /><TourListing /><Footer /></>} />
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
        <Route path="/cancellation-policy" element={<><Navbar /><CancellationPolicy /><Footer /></>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tours" element={<TourManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="tours/itinerary/:tourId" element={<TourItineraryBuilder />} />
          <Route path="dispatch" element={<TourDispatch />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="financials" element={<FinancialManagement />} />
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
        </Route>
      </Routes>
      <FloraGlobalAssistant />
    </>
  );
}

export default App;

