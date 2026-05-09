import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';
import './Bookings.css';

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(saved.reverse());
  }, []);

  const generatePDF = (b) => {
    const doc = new jsPDF();

    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Smart Trip Planner', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Booking Confirmation', 105, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Booking ID: ${b.bookingId}`, 105, 38, { align: 'center' });

    doc.setFillColor(240, 242, 255);
    doc.roundedRect(14, 52, 182, 18, 4, 4, 'F');
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Thank you for booking with Smart Trip Planner, ${b.userName}! Happy Journey!`,
      105, 63, { align: 'center' }
    );

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 240);
    doc.roundedRect(14, 76, 182, 76, 4, 4, 'FD');
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('JOURNEY DETAILS', 22, 86);
    doc.setDrawColor(200, 200, 230);
    doc.line(14, 89, 196, 89);

    const details = [
      ['Bus Name', b.busName],
      ['Bus Type', b.busType],
      ['From', b.from],
      ['To', b.to],
      ['Travel Date', b.date],
      ['Departure', b.departure],
      ['Seat(s)', b.seats ? b.seats.split(',').join(' | ') : ''],
    ];

    let y = 97;
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 150);
      doc.setFontSize(9);
      doc.text(label, 22, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 60);
      doc.setFontSize(10);
      doc.text(String(value), 100, y);
      y += 9;
    });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 158, 182, 30, 4, 4, 'FD');
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PASSENGER DETAILS', 22, 168);
    doc.line(14, 171, 196, 171);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 150);
    doc.text('Name', 22, 179);
    doc.text('Email', 100, 179);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 60);
    doc.setFontSize(10);
    doc.text(b.userName, 22, 186);
    doc.text(b.userEmail, 100, 186);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 194, 182, 60, 4, 4, 'FD');
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FARE BREAKDOWN', 22, 204);
    doc.line(14, 207, 196, 207);

    const fareRows = [
      ['Base Fare', `Rs. ${b.baseFare}`],
      ['GST (5%)', `Rs. ${b.gst}`],
      ['Platform Fee', `- Rs. 5`],
      ['Travel Insurance', b.insuranceFee > 0 ? `Rs. ${b.insuranceFee}` : 'Not Added'],
    ];

    let fy = 216;
    fareRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);
      doc.setFontSize(10);
      doc.text(label, 22, fy);
      doc.text(value, 185, fy, { align: 'right' });
      fy += 10;
    });

    doc.setFillColor(102, 126, 234);
    doc.roundedRect(14, 256, 182, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL AMOUNT', 22, 266);
    doc.text(`Rs. ${b.grandTotal}`, 185, 266, { align: 'right' });

    doc.setFillColor(102, 126, 234);
    doc.rect(0, 278, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Trip Planner | support@smarttrip.in | www.smarttrip.in', 105, 287, { align: 'center' });
    doc.text(`Booked on: ${b.bookedAt}`, 105, 293, { align: 'center' });

    doc.save(`SmartTrip_${b.bookingId}.pdf`);
  };

  return (
    <div className="bookings-wrapper">
      <Navbar />
      <div className="bookings-container">

        <div className="bookings-header">
          <div>
            <h2 className="bookings-title">My Bookings</h2>
            <p className="bookings-sub">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button className="home-btn" onClick={() => navigate('/')}>
            + New Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">🎫</div>
            <h3>No bookings yet!</h3>
            <p>Your booked tickets will appear here</p>
            <button className="book-now-btn" onClick={() => navigate('/')}>
              Book a Trip
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b, index) => (
              <div className="booking-card" key={index}>

                <div className="booking-card-top">
                  <div className="booking-id-badge">
                    #{b.bookingId}
                  </div>
                  <div className="booking-date-badge">
                    Booked: {b.bookedAt}
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="booking-route">
                    <div className="booking-city">
                      <span className="bcity-name">{b.from}</span>
                      <span className="bcity-label">From</span>
                    </div>
                    <div className="booking-route-center">
                      <div className="route-dots">
                        <div className="dot"></div>
                        <div className="route-line-dashed"></div>
                        <span className="bus-emoji-small">🚌</span>
                        <div className="route-line-dashed"></div>
                        <div className="dot"></div>
                      </div>
                      <span className="travel-date-badge">{b.date}</span>
                    </div>
                    <div className="booking-city right">
                      <span className="bcity-name">{b.to}</span>
                      <span className="bcity-label">To</span>
                    </div>
                  </div>

                  <div className="booking-details-row">
                    <div className="bdetail">
                      <span className="bdetail-label">Bus</span>
                      <span className="bdetail-value">{b.busName}</span>
                    </div>
                    <div className="bdetail">
                      <span className="bdetail-label">Type</span>
                      <span className="bdetail-value">{b.busType}</span>
                    </div>
                    <div className="bdetail">
                      <span className="bdetail-label">Departure</span>
                      <span className="bdetail-value">{b.departure}</span>
                    </div>
                    <div className="bdetail">
                      <span className="bdetail-label">Total Paid</span>
                      <span className="bdetail-value price">₹{b.grandTotal}</span>
                    </div>
                  </div>

                  <div className="booking-seats-row">
                    <span className="seats-label">Seats:</span>
                    {b.seats && b.seats.split(',').map((s, i) => (
                      <span key={i} className="seat-tag">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className="booking-card-footer">
                  <div className="insurance-tag">
                    {b.insuranceFee > 0 ? '🛡️ Insured' : 'No Insurance'}
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => generatePDF(b)}
                  >
                    Download Ticket
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;