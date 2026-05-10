# Smart Trip Planner

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-667eea?style=for-the-badge)](https://smart-trip-planner-phi.vercel.app/)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**A complete trip planning platform for Indian travelers.**
Book buses and trains, plan trips, explore destinations, and get AI-powered travel assistance — all in one place.

</div>

---

## 🖼️ Overview

Smart Trip Planner is a full-stack web application that makes travel planning simple and smart. Users can search for buses and trains between cities, view real road routes on an interactive map, select seats visually, and download instant PDF tickets. The platform also includes a budget trip planner, tourist place explorer, and an AI travel assistant.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🚌 **Bus & Train Booking** | Search and book buses and trains between any Indian cities |
| 🗺️ **Live Map with Road Routes** | Real road routes shown on interactive map using OSRM API |
| 💺 **Visual Seat Selection** | Lower deck seater and upper deck sleeper with different pricing |
| 🎟️ **Instant PDF Ticket** | Professional ticket with booking ID, fare breakdown and GST |
| 🏛️ **Explore Destination** | Find tourist places, hotels and restaurants at destination |
| 📅 **Budget Trip Planner** | Day-by-day itinerary with real cost calculations |
| 🤖 **AI Travel Assistant** | Groq AI powered chatbot for travel help |
| 🔒 **Secure Authentication** | BCrypt encrypted passwords with Spring Security |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=flat&logo=leaflet&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=springsecurity&logoColor=white)
![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=flat&logo=hibernate&logoColor=white)

### Database & Deployment
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)

### External APIs
| API | Purpose |
|---|---|
| OSRM | Real road distance and routing |
| Nominatim | City geocoding |
| Overpass | Tourist places data |
| Groq AI | AI travel assistant |

---

## 📁 Project Structure

```
Smart-Trip-Planner/
├── backend/                          # Spring Boot REST API
│   └── src/main/java/com/tripplanner/
│       ├── User.java                 # User entity
│       ├── Bus.java                  # Bus entity
│       ├── Train.java                # Train entity
│       ├── UserController.java       # Auth APIs
│       ├── BusController.java        # Bus search API
│       ├── TrainController.java      # Train search API
│       └── SecurityConfig.java       # CORS & Security
│
└── frontend/                         # React Application
    └── src/
        ├── pages/
        │   ├── Home.js               # Map + Search
        │   ├── SearchBuses.js        # Bus & Train results
        │   ├── BusDetails.js         # Seat selection
        │   ├── TrainDetails.js       # Train seat selection
        │   ├── Payment.js            # Booking & PDF
        │   ├── Bookings.js           # Booking history
        │   ├── TouristPlaces.js      # Explore destination
        │   ├── TripPlanner.js        # Budget planner
        │   ├── Login.js              # Authentication
        │   ├── Account.js            # User profile
        │   └── Help.js               # FAQ & Contact
        └── components/
            ├── Navbar.js             # Navigation
            └── Chatbot.js            # AI Assistant
```

---

## 🚀 Run Locally

### Prerequisites
- Java 17+
- Node.js 18+
- Git

### Backend
```bash
git clone https://github.com/ChowdamAshok/Smart-Trip-Planner.git
cd Smart-Trip-Planner/backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd Smart-Trip-Planner/frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://smart-trip-planner-phi.vercel.app/ |
| Backend | Render | https://smart-trip-planner-xxc3.onrender.com |
| Database | Neon PostgreSQL | Cloud hosted |

---

## 📸 Pages

- **Home** — Interactive map with search overlay
- **Search Results** — Buses and trains side by side with filters
- **Bus/Train Details** — Real road map + Visual seat selection
- **Payment** — Fare breakdown with GST and insurance option
- **Trip Planner** — Budget based day-by-day itinerary
- **Explore** — Tourist places, hotels, restaurants on map
- **Bookings** — All past bookings with PDF download
- **Account** — Profile management and password reset
- **Help** — FAQ and contact form

---

## 👨‍💻 Developer

<div align="center">

**Chowdam Ashok**

[![GitHub](https://img.shields.io/badge/GitHub-ChowdamAshok-181717?style=for-the-badge&logo=github)](https://github.com/ChowdamAshok)

</div>

---

<div align="center">

Made with ❤️ for Indian travelers 🇮🇳

⭐ Star this repo if you found it helpful!

</div>
