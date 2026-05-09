import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';
import './Payment.css';

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busName = searchParams.get('busName');
  const busType = searchParams.get('busType');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const seats = searchParams.get('seats');
  const date = searchParams.get('date');
  const departure = searchParams.get('departure');
  const totalParam = parseInt(searchParams.get('total'));

  const [insurance, setInsurance] = useState(false);
  const [booked, setBooked] = useState(false);

  const baseFare = totalParam;
  const gst = Math.round(baseFare * 0.05);
  const platformFee = -5;
  const insuranceFee = insurance ? 50 : 0;
  const grandTotal = baseFare + gst + platformFee + insuranceFee;

  const bookingId = 'STP' + Math.floor(100000 + Math.random() * 900000);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const generatePDF = (b) => {
    const doc = new jsPDF();

    // Header
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

    // Greeting
    doc.setFillColor(240, 242, 255);
    doc.roundedRect(14, 52, 182, 16, 4, 4, 'F');
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Thank you ${b.userName}! Happy Journey with Smart Trip Planner!`,
      105, 62, { align: 'center' }
    );

    // Journey details box
    const seatList = b.seats ? b.seats.split(',').map(s => s.trim()) : [];
    const boxHeight = 8 * 9 + 14;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 240);
    doc.roundedRect(14, 74, 182, boxHeight, 4, 4, 'FD');

    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('JOURNEY DETAILS', 22, 84);
    doc.setDrawColor(200, 200, 230);
    doc.line(14, 87, 196, 87);

    const details = [
      ['Bus Name', b.busName],
      ['Bus Type', b.busType],
      ['From', b.from],
      ['To', b.to],
      ['Travel Date', b.date],
      ['Departure', b.departure],
    ];

    let y = 95;
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

    // Seats as individual boxes
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 150);
    doc.setFontSize(9);
    doc.text('Seat(s)', 22, y);
    let sx = 100;
    seatList.forEach((seat) => {
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(sx, y - 6, 18, 9, 2, 2, 'F');
      doc.setTextColor(67, 56, 202);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(seat, sx + 9, y, { align: 'center' });
      sx += 22;
    });

    // Passenger details
    const passengerY = 74 + boxHeight + 5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 240);
    doc.roundedRect(14, passengerY, 182, 30, 4, 4, 'FD');
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PASSENGER DETAILS', 22, passengerY + 10);
    doc.line(14, passengerY + 13, 196, passengerY + 13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 150);
    doc.text('Name', 22, passengerY + 21);
    doc.text('Email', 100, passengerY + 21);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 60);
    doc.setFontSize(10);
    doc.text(b.userName, 22, passengerY + 28);
    doc.text(b.userEmail, 100, passengerY + 28);

    // Fare breakdown
    const fareY = passengerY + 36;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, fareY, 182, 56, 4, 4, 'FD');
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FARE BREAKDOWN', 22, fareY + 10);
    doc.line(14, fareY + 13, 196, fareY + 13);

    const fareRows = [
      ['Base Fare', `Rs. ${b.baseFare}`],
      ['GST (5%)', `Rs. ${b.gst}`],
      ['Platform Fee', `- Rs. 5`],
      ['Travel Insurance', b.insuranceFee > 0 ? `Rs. ${b.insuranceFee}` : 'Not Added'],
    ];

    let fy = fareY + 22;
    fareRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);
      doc.setFontSize(10);
      doc.text(label, 22, fy);
      doc.text(value, 185, fy, { align: 'right' });
      fy += 10;
    });

    // Total
    const totalY = fareY + 60;
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(14, totalY, 182, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL AMOUNT', 22, totalY + 10);
    doc.text(`Rs. ${b.grandTotal}`, 185, totalY + 10, { align: 'right' });

    // Footer
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 278, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Trip Planner | support@smarttrip.in | www.smarttrip.in', 105, 287, { align: 'center' });
    doc.text(`Booked on: ${b.bookedAt}`, 105, 293, { align: 'center' });

    doc.save(`SmartTrip_${b.bookingId}.pdf`);
  };

  const handleBook = () => {
    const booking = {
      bookingId,
      busName,
      busType,
      from,
      to,
      seats,
      date,
      departure,
      baseFare,
      gst,
      platformFee,
      insuranceFee,
      grandTotal,
      insurance,
      userName: user.name || 'Guest',
      userEmail: user.email || '',
      bookedAt: new Date().toLocaleString(),
    };

    const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existing));
    localStorage.setItem('lastBooking', JSON.stringify(booking));

    setBooked(true);
    generatePDF(booking);
  };

  if (booked) {
    return (
      <div className="payment-wrapper">
        <Navbar />
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2 className="success-title">Booking Confirmed!</h2>
            <p className="success-id">
              Booking ID: <strong>{bookingId}</strong>
            </p>
            <p className="success-msg">
              Thank you <strong>{user.name}</strong>! Your ticket has been
              downloaded. Happy Journey!
            </p>
            <div className="success-detail">
              <div className="success-detail-row">
                <span className="sdlabel">Bus</span>
                <span className="sdvalue">{busName}</span>
              </div>
              <div className="success-detail-row">
                <span className="sdlabel">Route</span>
                <span className="sdvalue">{from} → {to}</span>
              </div>
              <div className="success-detail-row">
                <span className="sdlabel">Date</span>
                <span className="sdvalue">{date}</span>
              </div>
              <div className="success-detail-row">
                <span className="sdlabel">Seats</span>
                <span className="sdvalue seat-chips">
                  {seats && seats.split(',').map((s, i) => (
                    <span key={i} className="seat-chip">{s.trim()}</span>
                  ))}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="sdlabel">Total Paid</span>
                <span className="sdvalue price-green">₹{grandTotal}</span>
              </div>
            </div>
            <div className="success-actions">
              <button
                className="re-download-btn"
                onClick={() => {
                  const b = JSON.parse(localStorage.getItem('lastBooking'));
                  generatePDF(b);
                }}
              >
                Download Again
              </button>
              <button className="go-home-btn" onClick={() => navigate('/')}>
                Back to Home
              </button>
              <button
                className="my-bookings-btn"
                onClick={() => navigate('/bookings')}
              >
                My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <Navbar />
      <div className="payment-container">

        {/* LEFT - ORDER SUMMARY */}
        <div className="order-summary">
          <div className="summary-header">
            <h2>Booking Summary</h2>
          </div>

          {/* Journey Info */}
          <div className="summary-section">
            <p className="section-label">JOURNEY DETAILS</p>
            <div className="journey-route">
              <div className="journey-city">
                <span className="city-name">{from}</span>
                <span className="city-label">From</span>
              </div>
              <div className="journey-arrow">
                <div className="arrow-line"></div>
                <span className="bus-icon-mid">🚌</span>
                <div className="arrow-line"></div>
              </div>
              <div className="journey-city right">
                <span className="city-name">{to}</span>
                <span className="city-label">To</span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Bus</span>
                <span className="detail-value">{busName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">{busType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date</span>
                <span className="detail-value">{date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Departure</span>
                <span className="detail-value">{departure}</span>
              </div>
              <div className="detail-item full">
                <span className="detail-label">Seats</span>
                <span className="detail-value seat-chips">
                  {seats && seats.split(',').map((s, i) => (
                    <span key={i} className="seat-chip">{s.trim()}</span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="summary-section">
            <p className="section-label">ADD-ONS</p>
            <div
              className={`insurance-box ${insurance ? 'selected' : ''}`}
              onClick={() => setInsurance(!insurance)}
            >
              <div className="insurance-left">
                <span className="insurance-icon">🛡️</span>
                <div>
                  <p className="insurance-title">Travel Insurance</p>
                  <p className="insurance-sub">
                    Coverage for trip cancellation and delays
                  </p>
                </div>
              </div>
              <div className="insurance-right">
                <span className="insurance-price">+ ₹50</span>
                <div className={`insurance-toggle ${insurance ? 'on' : ''}`}>
                  {insurance ? '✓' : '+'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - FARE BREAKDOWN */}
        <div className="fare-side">
          <div className="fare-card">
            <p className="fare-title">Fare Breakdown</p>

            <div className="fare-rows">
              <div className="fare-row">
                <span>Base Fare</span>
                <span>₹{baseFare}</span>
              </div>
              <div className="fare-row">
                <span>GST (5%)</span>
                <span>+ ₹{gst}</span>
              </div>
              <div className="fare-row discount">
                <span>Platform Fee</span>
                <span>- ₹5</span>
              </div>
              <div className={`fare-row insurance-row ${insurance ? 'active' : ''}`}>
                <span>Travel Insurance</span>
                <span>{insurance ? '+ ₹50' : '—'}</span>
              </div>
            </div>

            <div className="fare-total">
              <span>Total Amount</span>
              <span className="total-amount">₹{grandTotal}</span>
            </div>

            <button className="pay-btn" onClick={handleBook}>
              Confirm and Download Ticket
            </button>

            <p className="pay-note">
              Your ticket PDF will be downloaded automatically
            </p>
          </div>

          {/* Passenger Info */}
          <div className="passenger-card">
            <p className="section-label">PASSENGER</p>
            <div className="passenger-info">
              <div className="passenger-avatar">
                {user.name ? user.name[0].toUpperCase() : 'G'}
              </div>
              <div>
                <p className="passenger-name">{user.name || 'Guest'}</p>
                <p className="passenger-email">{user.email || ''}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Payment;