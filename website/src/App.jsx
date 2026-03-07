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

// Import pages
import Help from './pages/Help';
import PrivacySettings from './pages/PrivacySettings';
import Login from './pages/Login';
import Register from './pages/Register';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CompanyDetails from './pages/CompanyDetails';
import TourListing from './pages/TourListing';
import TourDetail from './pages/TourDetail';
import MyJourney from './pages/MyJourney';
import Destinations from './pages/Destinations';
import Guide from './pages/Guide';
import About from './pages/About';
import Careers from './pages/Careers';
import News from './pages/News';
import Stories from './pages/Stories';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import GroupChat from './pages/GroupChat';

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
    </Routes>
  );
}

export default App;
