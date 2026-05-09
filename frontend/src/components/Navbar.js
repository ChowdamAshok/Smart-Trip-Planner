import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('user');

  // MOBILE MENU STATE
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false); // close menu after click
  };

  return (
    <nav className="navbar">

      {/* TOP SECTION */}
      <div className="navbar-top">

        <div
          className="navbar-logo"
          onClick={() => handleNavigate('/')}
        >
          Smart Trip Planner
        </div>

        {/* HAMBURGER MENU */}
        <div
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

      {/* NAV LINKS */}
      <div className={`navbar-links ${menuOpen ? 'show' : ''}`}>

        <span onClick={() => handleNavigate('/')}>Home</span>

        <span onClick={() => handleNavigate('/planner')}>
          Planner
        </span>

        <span onClick={() => handleNavigate('/explore')}>
          Explore
        </span>

        <span onClick={() => handleNavigate('/bookings')}>
          Bookings
        </span>

        <span onClick={() => handleNavigate('/help')}>
          Help
        </span>

        {isLoggedIn ? (
          <>
            <button
              className="nav-btn account-btn"
              onClick={() => handleNavigate('/account')}
            >
              Account
            </button>

            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="nav-btn login-btn"
            onClick={() => handleNavigate('/login')}
          >
            Login / Register
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;