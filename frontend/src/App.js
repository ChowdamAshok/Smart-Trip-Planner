import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchBuses from './pages/SearchBuses';
import './App.css';
import Login from './pages/Login';
import BusDetails from './pages/BusDetails';
import Payment from './pages/Payment';
import Bookings from './pages/Bookings';
import Help from './pages/Help';
import Account from './pages/Account';
import TrainDetails from './pages/TrainDetails';
import TripPlanner from './pages/TripPlanner';
import TouristPlaces from './pages/TouristPlaces';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchBuses />} />
        <Route path="/bus/:id" element={<BusDetails />} />
        <Route path="/train/:id" element={<TrainDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/help" element={<Help />} />
        <Route path="/account" element={<Account />} />
        <Route path="/explore" element={<TouristPlaces />} />
        <Route path="/planner" element={<TripPlanner />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;