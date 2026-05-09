import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Help.css';

const faqs = [
  {
    question: 'How do I book a bus ticket?',
    answer:
      'Enter your starting city and destination on the home page, click Search Buses, choose your preferred bus, select your seats, pick a travel date, and confirm your booking on the payment page. Your ticket PDF will be downloaded automatically.',
  },
  {
    question: 'Why should I choose Smart Trip Planner?',
    answer:
      'Smart Trip Planner shows you real bus routes on an interactive map, detects your current location, finds the nearest bus stand, and even shows walking distance if you are in a village or small town. We offer a seamless booking experience with instant PDF tickets.',
  },
  {
    question: 'How does the village detection work?',
    answer:
      'When you enter a starting location, our system automatically checks if it is a village or small town. If it is, we find the nearest city with a bus stand and show you the walking or auto distance to reach it.',
  },
  {
    question: 'Can I select both lower and upper deck seats?',
    answer:
      'Yes! On the bus details page you can switch between Lower Deck (seater) and Upper Deck (sleeper) and select seats from both. Lower deck seats are cheaper and upper deck sleeper berths are slightly higher priced.',
  },
  {
    question: 'What is Travel Insurance and should I add it?',
    answer:
      'Travel Insurance costs just Rs. 50 extra and covers you for trip cancellations and unexpected delays. We recommend adding it for long distance journeys for peace of mind.',
  },
  {
    question: 'How do I download my ticket again?',
    answer:
      'Go to the My Bookings page from the navbar. You will see all your past bookings. Click the Download Ticket button on any booking to get your PDF ticket again anytime.',
  },
  {
    question: 'Is my personal data safe?',
    answer:
      'Yes. Your passwords are encrypted using BCrypt encryption and never stored as plain text. Your booking data is stored securely and we never share your personal information with third parties.',
  },
  {
    question: 'What if I need to cancel my booking?',
    answer:
      'Currently cancellations can be requested by contacting our support team via the contact form below. If you added Travel Insurance, you are eligible for a refund as per the insurance terms.',
  },
];

function Help() {
  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      alert('Please fill all fields!');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="help-wrapper">
      <Navbar />

      {/* HERO */}
      <div className="help-hero">
        <h1 className="help-hero-title">How can we help you?</h1>
        <p className="help-hero-sub">
          Find answers to common questions or send us a message
        </p>
      </div>

      <div className="help-container">

        {/* FAQ SECTION */}
        <div className="faq-section">
          <p className="section-heading">Frequently Asked Questions</p>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? 'open' : ''}`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    {openIndex === index ? '▲' : '▼'}
                  </span>
                </div>
                {openIndex === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="contact-section">
          <p className="section-heading">Still need help? Contact us</p>

          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">✅</div>
              <h3>Message Sent!</h3>
              <p>
                Thank you <strong>{form.name}</strong>! We will get back to
                you at <strong>{form.email}</strong> within 24 hours.
              </p>
              <button
                className="send-again-btn"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', message: '' });
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="contact-form">
              <div className="contact-info-boxes">
                <div className="contact-info-box">
                  <span className="cib-icon">📧</span>
                  <div>
                    <p className="cib-label">Email Us</p>
                    <p className="cib-value">support@smarttrip.in</p>
                  </div>
                </div>
                <div className="contact-info-box">
                  <span className="cib-icon">🕐</span>
                  <div>
                    <p className="cib-label">Response Time</p>
                    <p className="cib-value">Within 24 hours</p>
                  </div>
                </div>
                <div className="contact-info-box">
                  <span className="cib-icon">📞</span>
                  <div>
                    <p className="cib-label">Call Us</p>
                    <p className="cib-value">1800-123-4567</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Your Message</label>
                <textarea
                  name="message"
                  placeholder="Describe your issue or question..."
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
              <button className="contact-submit-btn" onClick={handleSubmit}>
                Send Message
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Help;