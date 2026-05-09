import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import './BusDetails.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BOOKED_SEATS = [3, 7, 12, 18, 25];
const BOOKED_BERTHS = [2, 5, 9];

function TrainDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const trainName = searchParams.get('trainName');
  const trainNumber = searchParams.get('trainNumber');
  const trainType = searchParams.get('trainType');
  const price = parseInt(searchParams.get('price'));
  const departure = searchParams.get('departure');
  const duration = searchParams.get('duration');

  const sleeperPrice = price;
  const acPrice = Math.round(price * 1.6);

  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeClass, setActiveClass] = useState('sleeper');
  const [travelDate, setTravelDate] = useState('');

  const sleeperSeats = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    booked: BOOKED_SEATS.includes(i + 1),
  }));

  const acSeats = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    booked: BOOKED_BERTHS.includes(i + 1),
  }));

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const geocode = async (city) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${city},India&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      return null;
    };

    const fetchRoute = async () => {
      const fc = await geocode(from);
      const tc = await geocode(to);
      if (fc && tc) {
        setFromCoords(fc);
        setToCoords(tc);
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${fc[1]},${fc[0]};${tc[1]},${tc[0]}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
            setRouteCoords(coords);
            setDistance((data.routes[0].distance / 1000).toFixed(0));
          }
        } catch (e) {
          setRouteCoords([fc, tc]);
        }
      }
    };
    fetchRoute();
  }, [from, to]);

  const toggleSeat = (cls, number, booked) => {
    if (booked) return;
    const key = `${cls}-${number}`;
    setSelectedSeats(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const isSelected = (cls, number) => selectedSeats.includes(`${cls}-${number}`);

  const totalPrice = selectedSeats.reduce((sum, key) => {
    return sum + (key.startsWith('sleeper') ? sleeperPrice : acPrice);
  }, 0);

  const handleBook = () => {
    const user = localStorage.getItem('user');
    if (!user) { alert('Please login first!'); navigate('/login'); return; }
    if (!travelDate) { alert('Please select a travel date!'); return; }
    if (selectedSeats.length === 0) { alert('Please select at least one seat!'); return; }
    const seatNumbers = selectedSeats.map(s => s.split('-')[1]).join(', ');
    navigate(`/payment?busName=${trainName} (${trainNumber})&busType=${trainType}&from=${from}&to=${to}&seats=${seatNumbers}&date=${travelDate}&departure=${departure}&total=${totalPrice}`);
  };

  const mapCenter = fromCoords || [12.9716, 77.5946];
  const currentSeats = activeClass === 'sleeper' ? sleeperSeats : acSeats;

  const renderSeats = (seats, cls) => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      const rowSeats = seats.slice(i, i + 4);
      rows.push(
        <div className="seat-row" key={i}>
          <div className="seat-pair">
            {rowSeats.slice(0, 2).map(seat => (
              <div
                key={seat.number}
                className={`seat-btn seater ${seat.booked ? 'booked' : isSelected(cls, seat.number) ? 'selected' : 'available'}`}
                onClick={() => toggleSeat(cls, seat.number, seat.booked)}
              >
                <span className="seat-number">{seat.number}</span>
                <span className="seat-icon">{cls === 'sleeper' ? '🛏️' : '💺'}</span>
              </div>
            ))}
          </div>
          <div className="seat-aisle"><span>|</span></div>
          <div className="seat-pair">
            {rowSeats.slice(2, 4).map(seat => (
              <div
                key={seat.number}
                className={`seat-btn seater ${seat.booked ? 'booked' : isSelected(cls, seat.number) ? 'selected' : 'available'}`}
                onClick={() => toggleSeat(cls, seat.number, seat.booked)}
              >
                <span className="seat-number">{seat.number}</span>
                <span className="seat-icon">{cls === 'sleeper' ? '🛏️' : '💺'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="busdetails-wrapper">
      <Navbar />
      <div className="busdetails-content">

        {/* MAP */}
        <div className="map-side">
          <div className="route-info-bar">
            <span className="route-point">🚂 {from}</span>
            <span className="route-arrow">⟶</span>
            <span className="route-point">🏁 {to}</span>
            {distance && <span className="route-distance">🛣️ {distance} km · {duration}</span>}
          </div>
          <MapContainer center={mapCenter} zoom={6} className="detail-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {fromCoords && <Marker position={fromCoords}><Popup>🚂 Departure: {from}</Popup></Marker>}
            {toCoords && <Marker position={toCoords}><Popup>🏁 Arrival: {to}</Popup></Marker>}
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} color="#f59e0b" weight={5} opacity={0.85} />
            )}
          </MapContainer>
        </div>

        {/* SEATS */}
        <div className="seat-side">
          <div className="bus-info-card" style={{background:'linear-gradient(135deg, #f59e0b, #d97706)'}}>
            <div className="bus-card-top">
              <div>
                <h3 className="bus-info-name">{trainName}</h3>
                <span className="bus-info-type">#{trainNumber} · {trainType}</span>
              </div>
              <div className="bus-departure-badge">
                <span className="dep-time">{departure}</span>
                <span className="dep-label">Departure</span>
              </div>
            </div>
            <div className="price-chips">
              <div className="price-chip">
                <span className="chip-label">🛏️ Sleeper</span>
                <span className="chip-price">₹{sleeperPrice}</span>
              </div>
              <div className="price-chip">
                <span className="chip-label">💺 AC Chair</span>
                <span className="chip-price">₹{acPrice}</span>
              </div>
            </div>
          </div>

          <div className="date-picker-box">
            <label className="date-label">📅 Select Travel Date</label>
            <input type="date" className="date-input" min={today} value={travelDate} onChange={e => setTravelDate(e.target.value)} />
          </div>

          <div className="floor-tabs">
            <button className={`floor-tab ${activeClass === 'sleeper' ? 'active' : ''}`} onClick={() => setActiveClass('sleeper')}>
              🛏️ Sleeper Class
            </button>
            <button className={`floor-tab ${activeClass === 'ac' ? 'active' : ''}`} onClick={() => setActiveClass('ac')}>
              💺 AC Chair Car
            </button>
          </div>

          <div className="bus-layout">
            <div className="bus-front">🚂 Front of Train</div>
            <div className="seat-grid-wrapper">
              <p className="deck-info">
                {activeClass === 'sleeper'
                  ? `Sleeper Class — ₹${sleeperPrice} per berth`
                  : `AC Chair Car — ₹${acPrice} per seat`}
              </p>
              {renderSeats(currentSeats, activeClass)}
            </div>
          </div>

          <div className="seat-legend">
            <span className="legend-item"><span className="legend-box available"></span> Available</span>
            <span className="legend-item"><span className="legend-box booked"></span> Booked</span>
            <span className="legend-item"><span className="legend-box selected"></span> Selected</span>
          </div>

          {selectedSeats.length > 0 && (
            <div className="booking-summary">
              <p className="summary-title">Booking Summary</p>
              <div className="summary-row">
                <span>Seats</span>
                <strong>{selectedSeats.map(s => s.split('-')[1]).join(', ')}</strong>
              </div>
              <div className="summary-row">
                <span>Date</span>
                <strong>{travelDate || '—'}</strong>
              </div>
              <div className="summary-row">
                <span>Passengers</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
              <button className="confirm-book-btn" onClick={handleBook}>
                Confirm & Book ✅
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TrainDetails;