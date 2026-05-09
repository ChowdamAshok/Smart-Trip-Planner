import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post('https://smart-trip-planner-xxc3.onrender.com/api/users/login', {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/');
      } else {
        await axios.post('https://smart-trip-planner-xxc3.onrender.com/api/users/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'USER',
        });
        alert('Registered successfully! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">
            {isLogin ? '👋 Welcome Back!' : '🚀 Create Account'}
          </h2>
          <p className="login-sub">
            {isLogin ? 'Login to book your trips' : 'Register to get started'}
          </p>

          {!isLogin && (
            <div className="login-input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="login-input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>

          <p className="login-toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;