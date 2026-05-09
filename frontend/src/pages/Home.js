import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import './Home.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const stats = [
  { number: '50,000+', label: 'Happy Travelers' },
  { number: '200+', label: 'Routes Available' },
  { number: '99%', label: 'On-Time Buses' },
  { number: '24/7', label: 'Customer Support' },
];

const features = [
  {
    icon: '🗺️',
    title: 'Live Map Navigation',
    desc: 'See your exact route on an interactive map. From your doorstep to the destination — every road is shown.',
  },
  {
    icon: '🚶',
    title: 'Village to City Detection',
    desc: 'Live in a village? We detect your location and show walking or auto distance to the nearest bus stand automatically.',
  },
  {
    icon: '💺',
    title: 'Choose Your Seat',
    desc: 'Pick your favorite seat from our visual seat map. Lower deck seater or upper deck sleeper — your choice.',
  },
  {
    icon: '🎟️',
    title: 'Instant PDF Ticket',
    desc: 'Get your booking confirmation as a beautiful PDF ticket instantly. Download and go — no printing needed.',
  },
  {
    icon: '🛡️',
    title: 'Travel Insurance',
    desc: 'Add travel insurance for just ₹50 and stay protected against trip cancellations and unexpected delays.',
  },
  {
    icon: '🔒',
    title: 'Secure & Safe',
    desc: 'Your passwords are encrypted and your data is protected. We never share your personal information.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Enter Your Route',
    desc: 'Type your starting city and destination. We auto-detect your current location for convenience.',
    icon: '📍',
  },
  {
    step: '02',
    title: 'Choose Your Bus',
    desc: 'Browse available buses with timings, prices, and seat availability. Filter by your preference.',
    icon: '🚌',
  },
  {
    step: '03',
    title: 'Select Your Seat',
    desc: 'Pick your seat from our visual bus layout. Choose lower deck seater or upper deck sleeper.',
    icon: '💺',
  },
  {
    step: '04',
    title: 'Pay & Download',
    desc: 'Complete your booking and instantly download your PDF ticket. Travel with confidence!',
    icon: '🎟️',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    city: 'Bangalore',
    text: 'Smart Trip Planner made my journey from Bangalore to Chennai so easy! The map showing my walking distance to the bus stand was super helpful.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    city: 'Hyderabad',
    text: 'I live in a small village near Mysore and this app found the nearest bus stand for me automatically. Amazing feature!',
    rating: 5,
  },
  {
    name: 'Anjali Reddy',
    city: 'Chennai',
    text: 'The PDF ticket download is so professional. I use Smart Trip Planner for all my travels now. Highly recommended!',
    rating: 5,
  },
];

const popularRoutes = [
  { from: 'Bangalore', to: 'Chennai', price: '₹350', duration: '6 hrs' },
  { from: 'Hyderabad', to: 'Bangalore', price: '₹450', duration: '8 hrs' },
  { from: 'Mumbai', to: 'Pune', price: '₹200', duration: '3 hrs' },
  { from: 'Delhi', to: 'Agra', price: '₹250', duration: '4 hrs' },
  { from: 'Mysore', to: 'Bangalore', price: '₹150', duration: '3 hrs' },
  { from: 'Coimbatore', to: 'Chennai', price: '₹400', duration: '7 hrs' },
];

function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [location, setLocation] = useState([12.9716, 77.5946]);
  const [cityName, setCityName] = useState('Detecting location...');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation([latitude, longitude]);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          'Your Location';
        setCityName(city);
        setFrom(city);
      },
      () => setCityName('Bangalore')
    );
  }, []);

  const handleSearch = () => {
    if (from && to) {
      navigate(`/search?from=${from}&to=${to}`);
    } else {
      alert('Please enter both From and To city!');
    }
  };

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* HERO - MAP + SEARCH */}
      <div className="map-wrapper">
        <MapContainer center={location} zoom={13} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={location}>
            <Popup>You are here — {cityName}</Popup>
          </Marker>
        </MapContainer>

        <div className="search-overlay">
          <div className="overlay-badge">India's Smartest Trip Planner</div>
          <h2 className="overlay-title">Where do you want to go?</h2>
          <p className="overlay-location">📍 {cityName}</p>

          <div className="overlay-input-group">
            <label>From</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Starting city"
            />
          </div>

          <div className="overlay-input-group">
            <label>To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Destination city"
            />
          </div>

          <button className="overlay-search-btn" onClick={handleSearch}>
            Search Buses
          </button>

          <div className="overlay-tags">
            <span onClick={() => setTo('Chennai')}>Chennai</span>
            <span onClick={() => setTo('Hyderabad')}>Hyderabad</span>
            <span onClick={() => setTo('Mumbai')}>Mumbai</span>
            <span onClick={() => setTo('Mysore')}>Mysore</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-section">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* POPULAR ROUTES */}
      <div className="section popular-section">
        <div className="section-header">
          <h2>Popular Routes</h2>
          <p>Most booked routes across India</p>
        </div>
        <div className="routes-grid">
          {popularRoutes.map((r, i) => (
            <div
              className="route-card"
              key={i}
              onClick={() => navigate(`/search?from=${r.from}&to=${r.to}`)}
            >
              <div className="route-card-top">
                <span className="route-from">{r.from}</span>
                <span className="route-arrow-icon">→</span>
                <span className="route-to">{r.to}</span>
              </div>
              <div className="route-card-bottom">
                <span className="route-price">Starting {r.price}</span>
                <span className="route-duration">🕐 {r.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="section features-section">
        <div className="section-header">
          <h2>Why Choose Smart Trip Planner?</h2>
          <p>Everything you need for a perfect journey</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section how-section">
        <div className="section-header white">
          <h2>How It Works</h2>
          <p>Book your ticket in 4 simple steps</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{s.step}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="step-connector">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <div className="section about-section">
        <div className="about-left">
          <div className="about-badge">About Us</div>
          <h2 className="about-title">
            Making Travel Smarter for Every Indian
          </h2>
          <p className="about-desc">
            Smart Trip Planner was built with one mission — to make bus travel
            simple, transparent, and accessible for everyone in India. Whether
            you live in a big city or a small village, we help you find the
            best bus to your destination with real-time maps and instant
            tickets.
          </p>
          <p className="about-desc">
            Our platform uses live geolocation to detect your current position,
            find the nearest bus stand, and show you exactly how to get there —
            whether by walking or by auto. No more confusion, no more missed
            buses.
          </p>
          <div className="about-points">
            <div className="about-point">
              <span className="about-point-icon">✅</span>
              Real-time location detection
            </div>
            <div className="about-point">
              <span className="about-point-icon">✅</span>
              Village to city walking distance
            </div>
            <div className="about-point">
              <span className="about-point-icon">✅</span>
              Instant PDF ticket download
            </div>
            <div className="about-point">
              <span className="about-point-icon">✅</span>
              Secure and encrypted bookings
            </div>
          </div>
          <button
            className="about-btn"
            onClick={() => navigate('/help')}
          >
            Learn More
          </button>
        </div>
        <div className="about-right">
          <div className="about-image-box">
            <div className="about-img-card card1">
              <span>🚌</span>
              <p>200+ Bus Routes</p>
            </div>
            <div className="about-img-card card2">
              <span>🗺️</span>
              <p>Live Map Tracking</p>
            </div>
            <div className="about-img-card card3">
              <span>🎟️</span>
              <p>Instant Tickets</p>
            </div>
            <div className="about-img-card card4">
              <span>🛡️</span>
              <p>Travel Insurance</p>
            </div>
            <div className="about-center-circle">
              <span>🚀</span>
              <p>Smart Trip</p>
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="section testimonials-section">
        <div className="section-header">
          <h2>What Our Travelers Say</h2>
          <p>Real experiences from real people</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">
                {'★'.repeat(t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {t.name[0]}
                </div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-city">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="cta-section">
        <h2 className="cta-title">Ready to Start Your Journey?</h2>
        <p className="cta-sub">
          Join 50,000+ travelers who trust Smart Trip Planner
        </p>
        <div className="cta-buttons">
          <button
            className="cta-btn-primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Book a Bus Now
          </button>
          <button
            className="cta-btn-secondary"
            onClick={() => navigate('/help')}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <p className="footer-logo">Smart Trip Planner</p>
            <p className="footer-tagline">
              Making travel smarter for every Indian
            </p>
          </div>
          <div className="footer-links">
            <p className="footer-link-title">Quick Links</p>
            <span onClick={() => navigate('/')}>Home</span>
            <span onClick={() => navigate('/bookings')}>My Bookings</span>
            <span onClick={() => navigate('/help')}>Help</span>
            <span onClick={() => navigate('/account')}>Account</span>
          </div>
          <div className="footer-links">
            <p className="footer-link-title">Contact</p>
            <span>support@smarttrip.in</span>
            <span>1800-123-4567</span>
            <span>123 Main Street, Bangalore</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Smart Trip Planner. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}

export default Home;