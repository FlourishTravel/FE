import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import ValueProp from './components/ValueProp';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Hero />
      <FeaturedDestinations />
      <ValueProp />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
