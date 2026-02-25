import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import ValueProp from './components/ValueProp';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

// Import pages
import Help from './pages/Help';
import PrivacySettings from './pages/PrivacySettings';
import Login from './pages/Login';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CompanyDetails from './pages/CompanyDetails';

// Home page component (inline)
const HomePage = () => (
  <div className="min-h-screen w-full">
    <Navbar />
    <Hero />
    <FeaturedDestinations />
    <ValueProp />
    <Testimonials />
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/help" element={<><Navbar /><Help /><Footer /></>} />
      <Route path="/privacy-settings" element={<><Navbar /><PrivacySettings /><Footer /></>} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/cookie-policy" element={<><Navbar /><CookiePolicy /><Footer /></>} />
      <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
      <Route path="/terms-of-service" element={<><Navbar /><TermsOfService /><Footer /></>} />
      <Route path="/company-details" element={<><Navbar /><CompanyDetails /><Footer /></>} />
    </Routes>
  );
}

export default App;
