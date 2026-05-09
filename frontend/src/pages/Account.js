import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Account.css";

function Account() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  const handleProfileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    if (!form.name || !form.email) {
      setProfileMsg("error:Name and email are required!");
      return;
    }
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setProfileMsg("success:Profile updated successfully!");
  };

  const handleResetPassword = async () => {
    setPasswordMsg("");
    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Please fill all password fields!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — verify current password via login API
      const loginRes = await axios.post(
        "http://localhost:8080/api/users/login",
        {
          email: user.email,
          password: passwordForm.currentPassword,
        },
      );

      // Step 2 — if login success reset password
      if (loginRes.status === 200 && loginRes.data) {
        const resetRes = await axios.post(
          "http://localhost:8080/api/users/resetpassword",
          {
            email: user.email,
            newPassword: passwordForm.newPassword,
          },
        );

        if (resetRes.status === 200) {
          setPasswordMsg("Password updated successfully!");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    } catch (err) {
      console.log(
        "Reset password error:",
        err.response?.status,
        err.response?.data,
      );
      if (err.response?.status === 400) {
        setPasswordError(
          err.response?.data === "Wrong password!"
            ? "Current password is incorrect!"
            : err.response?.data || "Something went wrong!",
        );
      } else if (err.response?.status === 403) {
        setPasswordError("Session expired. Please login again!");
      } else {
        setPasswordError("Something went wrong. Please try again!");
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user.name) {
    return (
      <div className="account-wrapper">
        <Navbar />
        <div className="not-logged-in">
          <div className="nli-icon">👤</div>
          <h2>You are not logged in</h2>
          <p>Please login to view your account details</p>
          <button className="nli-btn" onClick={() => navigate("/login")}>
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-wrapper">
      <Navbar />
      <div className="account-container">
        {/* LEFT SIDEBAR */}
        <div className="account-sidebar">
          <div className="account-avatar-section">
            <div className="account-avatar">{user.name[0].toUpperCase()}</div>
            <p className="account-avatar-name">{user.name}</p>
            <p className="account-avatar-email">{user.email}</p>
            <span className="account-role-badge">{user.role || "USER"}</span>
          </div>

          <div className="account-stats">
            <div className="stat-box">
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">
                ₹{bookings.reduce((s, b) => s + (b.grandTotal || 0), 0)}
              </span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>

          <div className="account-menu">
            <div
              className={`account-menu-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <span>👤</span> My Profile
            </div>
            <div
              className={`account-menu-item ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <span>🔒</span> Reset Password
            </div>
            <div
              className="account-menu-item"
              onClick={() => navigate("/bookings")}
            >
              <span>🎫</span> My Bookings
            </div>
            <div className="account-menu-item logout" onClick={handleLogout}>
              <span>🚪</span> Logout
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="account-content">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="account-card">
              <div className="account-card-header">
                <h2>My Profile</h2>
                <p>Update your personal information</p>
              </div>
              <div className="account-form">
                <div className="account-form-row">
                  <div className="account-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleProfileChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="account-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="account-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleProfileChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="account-info-box">
                  <p>
                    <strong>Account ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Account Type:</strong> {user.role || "USER"}
                  </p>
                  <p>
                    <strong>Member Since:</strong> 2026
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`account-msg ${
                      profileMsg.startsWith("success") ? "success" : "error"
                    }`}
                  >
                    {profileMsg.split(":")[1]}
                  </div>
                )}

                <button
                  className="account-save-btn"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="account-card">
              <div className="account-card-header">
                <h2>Reset Password</h2>
                <p>Keep your account secure with a strong password</p>
              </div>
              <div className="account-form">
                <div className="account-form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="account-form-row">
                  <div className="account-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="account-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <div className="password-tips">
                  <p className="tips-title">Password Tips</p>
                  <ul>
                    <li>Use at least 6 characters</li>
                    <li>Mix uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Do not use your name or email as password</li>
                  </ul>
                </div>

                {passwordError && (
                  <div className="account-msg error">{passwordError}</div>
                )}
                {passwordMsg && (
                  <div className="account-msg success">{passwordMsg}</div>
                )}

                <button
                  className="account-save-btn"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
