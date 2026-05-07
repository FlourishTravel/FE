import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import RecommendedForYou from './components/RecommendedForYou';
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
import Destinations from './pages/user/Destinations';
import Guide from './pages/user/Guide';
import About from './pages/user/About';
import Careers from './pages/user/Careers';
import News from './pages/user/News';
import Stories from './pages/user/Stories';
import Profile from './pages/user/Profile';
import Checkout from './pages/user/Checkout';
import GroupChat from './pages/user/GroupChat';
import CancellationPolicy from './pages/user/CancellationPolicy';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedAdminRoute from './pages/admin/components/ProtectedAdminRoute';
import Dashboard from './pages/admin/pages/Dashboard';
import TourManagement from './pages/admin/pages/TourManagement';
import TourItineraryBuilder from './pages/admin/pages/TourItineraryBuilder';
import TourDispatch from './pages/admin/pages/TourDispatch';
import BookingManagement from './pages/admin/pages/BookingManagement';
import CustomerManagement from './pages/admin/pages/CustomerManagement';
import FinancialManagement from './pages/admin/pages/FinancialManagement';
import StaffManagement from './pages/admin/pages/StaffManagement';

// Home page component (inline)
const HomePage = () => (
  <div className="min-h-screen w-full">
    <Navbar />
    <Hero />
    <FeaturedDestinations />
    <RecommendedForYou />
    <ValueProp />
    <Mission />
    <Footer />
    <FloatingChatbot />
  </div>
);

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
        <Route path="/destinations" element={<><Navbar /><Destinations /><Footer /></>} />
        <Route path="/guide" element={<><Navbar /><Guide /><Footer /></>} />
        <Route path="/tours" element={<><Navbar /><TourListing /><Footer /></>} />
        <Route path="/tours/:id" element={<><Navbar /><TourDetail /><Footer /></>} />
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
          <Route path="tours/itinerary/:tourId" element={<TourItineraryBuilder />} />
          <Route path="dispatch" element={<TourDispatch />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="financials" element={<FinancialManagement />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

