import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchBuses.css";

function SearchBuses() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const [buses, setBuses] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walkingInfo, setWalkingInfo] = useState(null);
  const [nearestCity, setNearestCity] = useState(null);
  const [placeType, setPlaceType] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const checkPlaceType = async (placeName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${placeName},India&format=json&limit=1&addressdetails=1`,
    );
    const data = await res.json();
    if (data.length === 0) return { type: "village", name: placeName };
    const place = data[0];
    const type = place.type;
    const address = place.address;
    const isBigCity =
      (type === "city" || type === "administrative") && address.city;
    return {
      type: isBigCity ? "city" : "village",
      name: placeName,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      address,
    };
  };

  const findNearestCity = async (lat, lon) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
    );
    const data = await res.json();
    return (
      data.address.city ||
      data.address.town ||
      data.address.county ||
      data.address.state_district
    );
  };

  const calcWalkingDistance = async (fromLat, fromLon, cityName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${cityName},India&format=json&limit=1`,
    );
    const data = await res.json();
    if (data.length === 0) return null;
    const toLat = parseFloat(data[0].lat);
    const toLon = parseFloat(data[0].lon);
    const R = 6371;
    const dLat = ((toLat - fromLat) * Math.PI) / 180;
    const dLon = ((toLon - fromLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((fromLat * Math.PI) / 180) *
        Math.cos((toLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return {
      distance: dist.toFixed(1),
      walkMins: Math.round((dist / 5) * 60),
      autoMins: Math.round((dist / 30) * 60),
      busStandCity: cityName,
    };
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const placeInfo = await checkPlaceType(from);
      setPlaceType(placeInfo.type);
      let searchFrom = from;

      if (placeInfo.type === "village") {
        const city = await findNearestCity(placeInfo.lat, placeInfo.lon);
        setNearestCity(city);
        searchFrom = city;
        const walking = await calcWalkingDistance(
          placeInfo.lat,
          placeInfo.lon,
          city,
        );
        setWalkingInfo(walking);
      }

      try {
        const [busRes, trainRes] = await Promise.all([
          axios.get(
            `https://smart-trip-planner-xxc3.onrender.com/api/buses/search?from=${searchFrom}&to=${to}`,
          ),
          axios.get(
            `https://smart-trip-planner-xxc3.onrender.com/api/trains/search?from=${searchFrom}&to=${to}`,
          ),
        ]);
        setBuses(busRes.data);
        setTrains(trainRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    init();
  }, [from, to]);

  const allResults = [
    ...buses.map((b) => ({ ...b, mode: "bus" })),
    ...trains.map((t) => ({ ...t, mode: "train" })),
  ].sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  const filtered =
    activeTab === "all"
      ? allResults
      : activeTab === "bus"
        ? allResults.filter((r) => r.mode === "bus")
        : allResults.filter((r) => r.mode === "train");

  const handleBook = (item) => {
    if (item.mode === "bus") {
      navigate(
        `/bus/${item.id}?from=${nearestCity || from}&to=${to}&busName=${item.busName}&busType=${item.busType}&price=${item.price}&departure=${item.departureTime}`,
      );
    } else {
      navigate(
        `/train/${item.id}?from=${nearestCity || from}&to=${to}&trainName=${item.trainName}&trainNumber=${item.trainNumber}&trainType=${item.trainType}&price=${item.price}&departure=${item.departureTime}&duration=${item.duration}`,
      );
    }
  };

  return (
    <div className="search-container">
      {/* HEADER */}
      <div className="search-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="header-route">
          <h2 className="route-title">
            🗺️ {from} → {to}
          </h2>
          {!loading && (
            <p className="bus-count">
              {buses.length} buses + {trains.length} trains found
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Finding best buses and trains...</p>
        </div>
      ) : (
        <div className="results-wrapper">
          {/* WALKING BANNER */}
          {placeType === "village" && walkingInfo && (
            <div className="walking-banner">
              <div className="walking-banner-top">
                <span className="walking-icon">🗺️</span>
                <div>
                  <p className="walking-title">
                    You are in a village — nearest station is in{" "}
                    <strong>{walkingInfo.busStandCity}</strong>
                  </p>
                  <p className="walking-sub">
                    Buses and trains depart from {walkingInfo.busStandCity}
                  </p>
                </div>
              </div>
              <div className="walking-options">
                <div className="walk-option">
                  <span className="walk-option-icon">🚶</span>
                  <div>
                    <p className="walk-option-title">Walk</p>
                    <p className="walk-option-detail">
                      {walkingInfo.distance} km · ~{walkingInfo.walkMins} mins
                    </p>
                  </div>
                </div>
                <div className="walk-divider"></div>
                <div className="walk-option">
                  <span className="walk-option-icon">🛺</span>
                  <div>
                    <p className="walk-option-title">Auto / Cab</p>
                    <p className="walk-option-detail">
                      {walkingInfo.distance} km · ~{walkingInfo.autoMins} mins
                    </p>
                  </div>
                </div>
                <div className="walk-divider"></div>
                <div className="walk-option">
                  <span className="walk-option-icon">📍</span>
                  <div>
                    <p className="walk-option-title">Station</p>
                    <p className="walk-option-detail">
                      {walkingInfo.busStandCity} Central
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CITY BANNER */}
          {placeType === "city" && (
            <div className="city-banner">
              <span>✅</span>
              <p>
                Buses and trains available directly from <strong>{from}</strong>
              </p>
            </div>
          )}

          {/* FILTER TABS */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              🚦 All ({allResults.length})
            </button>
            <button
              className={`filter-tab ${activeTab === "bus" ? "active" : ""}`}
              onClick={() => setActiveTab("bus")}
            >
              🚌 Buses ({buses.length})
            </button>
            <button
              className={`filter-tab ${activeTab === "train" ? "active" : ""}`}
              onClick={() => setActiveTab("train")}
            >
              🚂 Trains ({trains.length})
            </button>
          </div>

          {/* RESULTS LIST */}
          <div className="bus-list">
            {filtered.map((item, index) => (
              <div
                className={`bus-card ${item.mode === "train" ? "train-card" : ""}`}
                key={index}
              >
                {/* MODE BADGE */}
                <div className={`mode-badge ${item.mode}`}>
                  {item.mode === "bus" ? "🚌 Bus" : "🚂 Train"}
                </div>

                <div className="bus-left">
                  <h3 className="bus-name">
                    {item.mode === "bus" ? item.busName : item.trainName}
                  </h3>
                  <span className="bus-type-badge">
                    {item.mode === "bus"
                      ? item.busType
                      : `#${item.trainNumber} · ${item.trainType}`}
                  </span>
                </div>

                <div className="bus-middle">
                  <div className="bus-time-box">
                    <span className="bus-time">{item.departureTime}</span>
                    <span className="bus-time-label">Departure</span>
                  </div>
                  {item.duration && (
                    <div className="duration-box">
                      <span className="duration-time">{item.duration}</span>
                      <span className="bus-time-label">Duration</span>
                    </div>
                  )}
                  <div className="bus-city-box">
                    <span className="bus-city">{nearestCity || from}</span>
                    <span className="bus-city-label">Board here</span>
                  </div>
                </div>

                <div className="bus-right">
                  <div className="seats-left">
                    💺 {item.availableSeats} seats left
                  </div>
                  <p className="price">₹{item.price}</p>
                  <button
                    className="book-button"
                    onClick={() => handleBook(item)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EXPLORE DESTINATION BANNER */}
          <div className="explore-banner">
            <div className="explore-banner-left">
              <span className="explore-banner-icon">🏛️</span>
              <div>
                <p className="explore-banner-title">Explore {to}</p>
                <p className="explore-banner-sub">
                  Find tourist places, hotels and restaurants at your
                  destination
                </p>
              </div>
            </div>
            <div className="explore-banner-actions">
              <button
                className="explore-banner-btn"
                onClick={() => navigate(`/explore?city=${to}`)}
              >
                Explore Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBuses;
