import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "../components/Navbar";
import "./BusDetails.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LOWER_BOOKED = [2, 5, 9, 14, 18, 22, 27];
const UPPER_BOOKED = [2, 5, 8, 11];

function BusDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const busName = searchParams.get("busName");
  const busType = searchParams.get("busType");
  const price = parseInt(searchParams.get("price"));
  const departure = searchParams.get("departure");

  const lowerPrice = price;
  const upperPrice = Math.round(price * 1.4);

  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeFloor, setActiveFloor] = useState("lower");
  const [travelDate, setTravelDate] = useState("");

  // Lower: 30 seater seats (2+2 layout)
  const lowerSeats = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    booked: LOWER_BOOKED.includes(i + 1),
  }));

  // Upper: 14 sleeper berths (1+1 layout)
  const upperSeats = Array.from({ length: 14 }, (_, i) => ({
    number: i + 1,
    booked: UPPER_BOOKED.includes(i + 1),
  }));

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const geocode = async (city) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${city},India&format=json&limit=1`,
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
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
            `https://router.project-osrm.org/route/v1/driving/${fc[1]},${fc[0]};${tc[1]},${tc[0]}?overview=full&geometries=geojson`,
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(
              ([lon, lat]) => [lat, lon],
            );
            setRouteCoords(coords);
            const dist = (data.routes[0].distance / 1000).toFixed(0);
            setDistance(dist);
          }
        } catch (e) {
          setRouteCoords([fc, tc]);
        }
      }
    };

    fetchRoute();
  }, [from, to]);

  const toggleSeat = (floor, number, booked) => {
    if (booked) return;
    const key = `${floor}-${number}`;
    setSelectedSeats((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const isSeatSelected = (floor, number) =>
    selectedSeats.includes(`${floor}-${number}`);

  const totalPrice = selectedSeats.reduce((sum, key) => {
    const floor = key.split("-")[0];
    return sum + (floor === "lower" ? lowerPrice : upperPrice);
  }, 0);

  const handleBook = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("Please login first!");
      navigate("/login");
      return;
    }
    if (!travelDate) {
      alert("Please select a travel date!");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat!");
      return;
    }

    const seatNumbers = selectedSeats.map((s) => s.split("-")[1]).join(", ");

    navigate(
      `/payment?busName=${busName}&busType=${busType}&from=${from}&to=${to}&seats=${seatNumbers}&date=${travelDate}&departure=${departure}&total=${totalPrice}`,
    );
  };

  const mapCenter = fromCoords || [12.9716, 77.5946];

  // Render lower deck - 2+2 seater layout
  const renderLowerDeck = () => {
    const rows = [];
    for (let i = 0; i < lowerSeats.length; i += 4) {
      const rowSeats = lowerSeats.slice(i, i + 4);
      rows.push(
        <div className="seat-row" key={i}>
          <div className="seat-pair">
            {rowSeats.slice(0, 2).map((seat) => (
              <div
                key={seat.number}
                className={`seat-btn seater ${
                  seat.booked
                    ? "booked"
                    : isSeatSelected("lower", seat.number)
                      ? "selected"
                      : "available"
                }`}
                onClick={() => toggleSeat("lower", seat.number, seat.booked)}
                title={`Seat ${seat.number} - ₹${lowerPrice}`}
              >
                <span className="seat-number">{seat.number}</span>
                <span className="seat-icon">💺</span>
              </div>
            ))}
          </div>
          <div className="seat-aisle">
            <span>|</span>
          </div>
          <div className="seat-pair">
            {rowSeats.slice(2, 4).map((seat) => (
              <div
                key={seat.number}
                className={`seat-btn seater ${
                  seat.booked
                    ? "booked"
                    : isSeatSelected("lower", seat.number)
                      ? "selected"
                      : "available"
                }`}
                onClick={() => toggleSeat("lower", seat.number, seat.booked)}
                title={`Seat ${seat.number} - ₹${lowerPrice}`}
              >
                <span className="seat-number">{seat.number}</span>
                <span className="seat-icon">💺</span>
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return rows;
  };

  // Render upper deck - 1+1 sleeper layout
  const renderUpperDeck = () => {
    const rows = [];
    for (let i = 0; i < upperSeats.length; i += 2) {
      const rowSeats = upperSeats.slice(i, i + 2);
      rows.push(
        <div className="berth-row" key={i}>
          {rowSeats.map((seat) => (
            <div
              key={seat.number}
              className={`berth-btn ${
                seat.booked
                  ? "booked"
                  : isSeatSelected("upper", seat.number)
                    ? "selected"
                    : "available"
              }`}
              onClick={() => toggleSeat("upper", seat.number, seat.booked)}
              title={`Berth ${seat.number} - ₹${upperPrice}`}
            >
              <span className="berth-icon">🛏️</span>
              <span className="berth-number">Berth {seat.number}</span>
              <span className="berth-price">₹{upperPrice}</span>
            </div>
          ))}
        </div>,
      );
    }
    return rows;
  };

  return (
    <div className="busdetails-wrapper">
      <Navbar />
      <div className="busdetails-content">
        {/* LEFT MAP */}
        <div className="map-side">
          <div className="route-info-bar">
            <span className="route-point">📍 {from}</span>
            <span className="route-arrow">⟶</span>
            <span className="route-point">🏁 {to}</span>
            {distance && (
              <span className="route-distance">🛣️ {distance} km by road</span>
            )}
          </div>
          <MapContainer center={mapCenter} zoom={6} className="detail-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {fromCoords && (
              <Marker position={fromCoords}>
                <Popup>🚌 Start: {from}</Popup>
              </Marker>
            )}
            {toCoords && (
              <Marker position={toCoords}>
                <Popup>🏁 End: {to}</Popup>
              </Marker>
            )}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                color="#667eea"
                weight={5}
                opacity={0.85}
              />
            )}
          </MapContainer>
        </div>

        {/* RIGHT SEATS */}
        <div className="seat-side">
          {/* Bus Info */}
          <div className="bus-info-card">
            <div className="bus-card-top">
              <div>
                <h3 className="bus-info-name">{busName}</h3>
                <span className="bus-info-type">{busType}</span>
              </div>
              <div className="bus-departure-badge">
                <span className="dep-time">{departure}</span>
                <span className="dep-label">Departure</span>
              </div>
            </div>
            <div className="price-chips">
              <div className="price-chip">
                <span className="chip-label">💺 Seater</span>
                <span className="chip-price">₹{lowerPrice}</span>
              </div>
              <div className="price-chip">
                <span className="chip-label">🛏️ Sleeper</span>
                <span className="chip-price">₹{upperPrice}</span>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="date-picker-box">
            <label className="date-label">📅 Select Travel Date</label>
            <input
              type="date"
              className="date-input"
              min={today}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
            />
          </div>

          {/* Floor Tabs */}
          <div className="floor-tabs">
            <button
              className={`floor-tab ${activeFloor === "lower" ? "active" : ""}`}
              onClick={() => setActiveFloor("lower")}
            >
              💺 Lower Deck (Seater)
            </button>
            <button
              className={`floor-tab ${activeFloor === "upper" ? "active" : ""}`}
              onClick={() => setActiveFloor("upper")}
            >
              🛏️ Upper Deck (Sleeper)
            </button>
          </div>

          {/* Bus Layout */}
          <div className="bus-layout">
            <div className="bus-front">🚌 Front of Bus</div>

            {activeFloor === "lower" ? (
              <div className="seat-grid-wrapper">
                <p className="deck-info">
                  2+2 Seater Layout — ₹{lowerPrice} per seat
                </p>
                {renderLowerDeck()}
              </div>
            ) : (
              <div className="berth-grid-wrapper">
                <p className="deck-info">
                  1+1 Sleeper Layout — ₹{upperPrice} per berth
                </p>
                {renderUpperDeck()}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="seat-legend">
            <span className="legend-item">
              <span className="legend-box available"></span> Available
            </span>
            <span className="legend-item">
              <span className="legend-box booked"></span> Booked
            </span>
            <span className="legend-item">
              <span className="legend-box selected"></span> Selected
            </span>
          </div>

          {/* Booking Summary */}
          {selectedSeats.length > 0 && (
            <div className="booking-summary">
              <p className="summary-title">Booking Summary</p>
              <div className="summary-row">
                <span>Seats</span>
                <strong>
                  {selectedSeats
                    .map((s) => {
                      const [floor, num] = s.split("-");
                      return `${floor === "upper" ? "🛏️" : "💺"}${num}`;
                    })
                    .join(", ")}
                </strong>
              </div>
              <div className="summary-row">
                <span>Travel Date</span>
                <strong>{travelDate || "—"}</strong>
              </div>
              <div className="summary-row">
                <span>Passengers</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="summary-total">
                <span>Total Amount</span>
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

export default BusDetails;
