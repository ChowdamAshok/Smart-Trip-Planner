import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import './TouristPlaces.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// CUSTOM MARKER ICONS
const createIcon = (color) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:22px;
        height:22px;
        border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const touristIcon = createIcon('#667eea');
const hotelIcon = createIcon('#f59e0b');
const restaurantIcon = createIcon('#10b981');

const CATEGORIES = [
  {
    key: 'tourist',
    label: 'Tourist Places',
    icon: '🏛️',
    color: '#667eea',
  },
  {
    key: 'hotel',
    label: 'Hotels',
    icon: '🏨',
    color: '#f59e0b',
  },
  {
    key: 'restaurant',
    label: 'Restaurants',
    icon: '🍽️',
    color: '#10b981',
  },
];

function TouristPlaces() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get('city') || 'Chennai';

  const [activeCategory, setActiveCategory] =
    useState('tourist');

  const [places, setPlaces] = useState([]);

  const [loading, setLoading] = useState(false);

  const [cityCoords, setCityCoords] = useState(null);

  const [searchCity, setSearchCity] =
    useState(destination);

  const [inputCity, setInputCity] =
    useState(destination);

  // FETCH PLACES
  const fetchPlaces = async (city, category) => {
    setLoading(true);
    setPlaces([]);

    try {
      // GET CITY COORDINATES
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${city},India&format=json&limit=1`
      );

      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        alert('City not found!');
        setLoading(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);

      setCityCoords([lat, lon]);

      let overpassQuery = '';

      // TOURIST PLACES
      if (category === 'tourist') {
        overpassQuery = `
          [out:json][timeout:40];
          (
            node["tourism"](around:30000,${lat},${lon});
            way["tourism"](around:30000,${lat},${lon});
            relation["tourism"](around:30000,${lat},${lon});

            node["historic"](around:30000,${lat},${lon});
            way["historic"](around:30000,${lat},${lon});
            relation["historic"](around:30000,${lat},${lon});

            node["amenity"="place_of_worship"](around:30000,${lat},${lon});
            way["amenity"="place_of_worship"](around:30000,${lat},${lon});
            relation["amenity"="place_of_worship"](around:30000,${lat},${lon});
          );
          out center 100;
        `;
      }

      // HOTELS
      else if (category === 'hotel') {
        overpassQuery = `
          [out:json][timeout:40];
          (
            node["tourism"="hotel"](around:20000,${lat},${lon});
            way["tourism"="hotel"](around:20000,${lat},${lon});
            relation["tourism"="hotel"](around:20000,${lat},${lon});

            node["tourism"="guest_house"](around:20000,${lat},${lon});
            way["tourism"="guest_house"](around:20000,${lat},${lon});
            relation["tourism"="guest_house"](around:20000,${lat},${lon});

            node["tourism"="hostel"](around:20000,${lat},${lon});
            way["tourism"="hostel"](around:20000,${lat},${lon});
            relation["tourism"="hostel"](around:20000,${lat},${lon});

            node["tourism"="resort"](around:20000,${lat},${lon});
            way["tourism"="resort"](around:20000,${lat},${lon});
            relation["tourism"="resort"](around:20000,${lat},${lon});
          );
          out center 100;
        `;
      }

      // RESTAURANTS
      else {
        overpassQuery = `
          [out:json][timeout:40];
          (
            node["amenity"="restaurant"](around:15000,${lat},${lon});
            way["amenity"="restaurant"](around:15000,${lat},${lon});
            relation["amenity"="restaurant"](around:15000,${lat},${lon});

            node["amenity"="cafe"](around:15000,${lat},${lon});
            way["amenity"="cafe"](around:15000,${lat},${lon});
            relation["amenity"="cafe"](around:15000,${lat},${lon});

            node["amenity"="fast_food"](around:15000,${lat},${lon});
            way["amenity"="fast_food"](around:15000,${lat},${lon});
            relation["amenity"="fast_food"](around:15000,${lat},${lon});

            node["amenity"="food_court"](around:15000,${lat},${lon});
            way["amenity"="food_court"](around:15000,${lat},${lon});
            relation["amenity"="food_court"](around:15000,${lat},${lon});
          );
          out center 100;
        `;
      }

      // FETCH OVERPASS DATA
      const overpassRes = await fetch(
        'https://overpass-api.de/api/interpreter',
        {
          method: 'POST',
          body: overpassQuery,
        }
      );

      const overpassData = await overpassRes.json();

      const elements = overpassData.elements || [];

      // MAP DATA
      const mapped = elements
        .filter(
          (e) =>
            (e.lat || e.center) &&
            e.tags &&
            e.tags.name
        )
        .map((e) => ({
          id: e.id,

          name: e.tags.name,

          lat: e.lat || e.center?.lat,

          lon: e.lon || e.center?.lon,

          type:
            e.tags.tourism ||
            e.tags.amenity ||
            e.tags.historic ||
            'place',

          cuisine: e.tags.cuisine || '',

          phone:
            e.tags.phone ||
            e.tags['contact:phone'] ||
            '',

          website:
            e.tags.website ||
            e.tags['contact:website'] ||
            '',

          opening: e.tags.opening_hours || '',

          category,
        }));

      // REMOVE DUPLICATES
      const uniquePlaces = mapped.filter(
        (place, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.name === place.name &&
              p.lat === place.lat
          )
      );

      setPlaces(uniquePlaces);
    } catch (err) {
      console.error('Error fetching places:', err);
    }

    setLoading(false);
  };

  // USE EFFECT
  useEffect(() => {
    fetchPlaces(searchCity, activeCategory);
  }, [searchCity, activeCategory]);

  // MARKER ICON
  const getMarkerIcon = (category) => {
    if (category === 'tourist') return touristIcon;
    if (category === 'hotel') return hotelIcon;
    return restaurantIcon;
  };

  // CATEGORY COLOR
  const getCategoryColor = (category) => {
    const found = CATEGORIES.find(
      (c) => c.key === category
    );

    return found ? found.color : '#667eea';
  };

  return (
    <div className="tourist-wrapper">
      <Navbar />

      {/* HERO SECTION */}

      <div className="tourist-hero">
        <h1>Explore {searchCity}</h1>

        <p>
          Discover tourist places, hotels and restaurants
        </p>

        <div className="tourist-search-bar">
          <input
            type="text"
            value={inputCity}
            placeholder="Enter city name..."
            onChange={(e) =>
              setInputCity(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchCity(inputCity);
              }
            }}
          />

          <button
            onClick={() => setSearchCity(inputCity)}
          >
            Explore
          </button>
        </div>
      </div>

      {/* CONTAINER */}

      <div className="tourist-container">

        {/* CATEGORY TABS */}

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`category-tab ${
                activeCategory === cat.key
                  ? 'active'
                  : ''
              }`}
              style={
                activeCategory === cat.key
                  ? {
                      borderColor: cat.color,
                      color: cat.color,
                      background: `${cat.color}15`,
                    }
                  : {}
              }
              onClick={() =>
                setActiveCategory(cat.key)
              }
            >
              {cat.icon} {cat.label}

              {!loading &&
                activeCategory === cat.key &&
                places.length > 0 && (
                  <span className="cat-count">
                    {places.length}
                  </span>
                )}
            </button>
          ))}

          <button
            className="back-to-search-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* MAIN CONTENT */}

        <div className="tourist-content">

          {/* MAP SIDE */}

          <div className="tourist-map-side">
            {cityCoords && (
              <MapContainer
                center={cityCoords}
                zoom={13}
                className="tourist-map"
                key={searchCity + activeCategory}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {places.map((place) => (
                  <Marker
                    key={place.id}
                    position={[
                      place.lat,
                      place.lon,
                    ]}
                    icon={getMarkerIcon(
                      place.category
                    )}
                  >
                    <Popup>
                      <div
                        style={{
                          minWidth: '160px',
                        }}
                      >
                        <strong>
                          {place.name}
                        </strong>

                        <br />

                        <span
                          style={{
                            fontSize: '12px',
                            color: '#777',
                            textTransform:
                              'capitalize',
                          }}
                        >
                          {place.type}
                        </span>

                        {place.cuisine && (
                          <p>
                            🍴 {place.cuisine}
                          </p>
                        )}

                        {place.phone && (
                          <p>
                            📞 {place.phone}
                          </p>
                        )}

                        {place.opening && (
                          <p>
                            🕐 {place.opening}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* LEGEND */}

            <div className="map-legend-box">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="legend-item-row"
                >
                  <div
                    className="legend-dot"
                    style={{
                      background: cat.color,
                    }}
                  ></div>

                  <span>
                    {cat.icon} {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LIST SIDE */}

          <div className="tourist-list-side">

            <div className="list-header">
              <h3>
                {
                  CATEGORIES.find(
                    (c) =>
                      c.key ===
                      activeCategory
                  )?.icon
                }{' '}
                {
                  CATEGORIES.find(
                    (c) =>
                      c.key ===
                      activeCategory
                  )?.label
                }{' '}
                in {searchCity}
              </h3>

              {!loading && (
                <span className="list-count">
                  {places.length} found
                </span>
              )}
            </div>

            {loading ? (
              <div className="tourist-loading">
                <div className="spinner"></div>

                <p>Finding places...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="no-places">
                <p className="no-places-icon">
                  🔍
                </p>

                <p>
                  No places found in{' '}
                  {searchCity}
                </p>

                <p
                  style={{
                    fontSize: '12px',
                    color: '#999',
                  }}
                >
                  Try another city
                </p>
              </div>
            ) : (
              <div className="places-list">

                {places.map(
                  (place, index) => (
                    <div
                      className="place-card"
                      key={place.id}
                    >

                      {/* LEFT */}

                      <div className="place-card-left">
                        <div
                          className="place-number"
                          style={{
                            background:
                              getCategoryColor(
                                place.category
                              ),
                          }}
                        >
                          {index + 1}
                        </div>
                      </div>

                      {/* BODY */}

                      <div className="place-card-body">

                        <h4 className="place-name">
                          {place.name}
                        </h4>

                        <span
                          className="place-type-badge"
                          style={{
                            background:
                              getCategoryColor(
                                place.category
                              ) + '20',
                            color:
                              getCategoryColor(
                                place.category
                              ),
                          }}
                        >
                          {place.type}
                        </span>

                        {place.cuisine && (
                          <p className="place-detail">
                            🍴{' '}
                            {place.cuisine}
                          </p>
                        )}

                        {place.opening && (
                          <p className="place-detail">
                            🕐{' '}
                            {place.opening}
                          </p>
                        )}

                        {place.phone && (
                          <p className="place-detail">
                            📞 {place.phone}
                          </p>
                        )}

                        {place.website && (
                          <a
                            className="place-website"
                            href={
                              place.website
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            🌐 Visit Website
                          </a>
                        )}
                      </div>

                      {/* RIGHT */}

                      <div className="place-card-right">
                        <a
                          className="directions-btn"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Directions
                        </a>
                      </div>

                    </div>
                  )
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TouristPlaces;