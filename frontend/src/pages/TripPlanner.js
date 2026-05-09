import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';
import './TripPlanner.css';

const BUDGET_PRESETS = [
  { type: 'Budget', icon: '💚', color: '#10b981', hotelPerNight: 400, foodPerDay: 200, activityPerDay: 150 },
  { type: 'Mid-Range', icon: '💛', color: '#f59e0b', hotelPerNight: 1500, foodPerDay: 500, activityPerDay: 400 },
  { type: 'Luxury', icon: '💜', color: '#8b5cf6', hotelPerNight: 5000, foodPerDay: 1500, activityPerDay: 1000 },
];

const POPULAR_DESTINATIONS = [
  { city: 'Goa', emoji: '🏖️', desc: 'Beaches & Nightlife' },
  { city: 'Mysore', emoji: '🏰', desc: 'Palaces & Culture' },
  { city: 'Ooty', emoji: '🌿', desc: 'Hills & Nature' },
  { city: 'Chennai', emoji: '🏛️', desc: 'History & Food' },
  { city: 'Hampi', emoji: '🗿', desc: 'Ancient Ruins' },
  { city: 'Coorg', emoji: '☕', desc: 'Coffee & Forests' },
];

function TripPlanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    from: '',
    to: '',
    days: 3,
    people: 2,
    budgetType: 'Mid-Range',
    totalBudget: '',
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getDistance = async (from, to) => {
    try {
      const gFrom = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(from) + ',India&format=json&limit=1').then(r => r.json());
      const gTo = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(to) + ',India&format=json&limit=1').then(r => r.json());
      if (gFrom.length === 0 || gTo.length === 0) return 300;
      const lat1 = parseFloat(gFrom[0].lat);
      const lon1 = parseFloat(gFrom[0].lon);
      const lat2 = parseFloat(gTo[0].lat);
      const lon2 = parseFloat(gTo[0].lon);
      const osrm = await fetch('https://router.project-osrm.org/route/v1/driving/' + lon1 + ',' + lat1 + ';' + lon2 + ',' + lat2 + '?overview=false').then(r => r.json());
      if (osrm.routes && osrm.routes.length > 0) {
        return Math.round(osrm.routes[0].distance / 1000);
      }
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    } catch (e) {
      return 300;
    }
  };

  const generatePlan = async () => {
    if (!form.from || !form.to) { alert('Please enter From and To city!'); return; }
    setLoading(true);

    const distance = await getDistance(form.from, form.to);
    const budget = BUDGET_PRESETS.find(b => b.type === form.budgetType);
    const days = parseInt(form.days);
    const people = parseInt(form.people);

    const transportCost = Math.round(distance * 1.2 * people);
    const hotelCost = budget.hotelPerNight * (days > 1 ? days - 1 : 1);
    const foodCost = budget.foodPerDay * days * people;
    const activityCost = budget.activityPerDay * days * people;
    const miscCost = Math.round((hotelCost + foodCost) * 0.08);
    const totalCost = transportCost + hotelCost + foodCost + activityCost + miscCost;
    const userBudget = parseInt(form.totalBudget) || totalCost;
    const remaining = userBudget - totalCost;

    const itinerary = [];
    for (let i = 1; i <= days; i++) {
      const dayActivities = [];
      if (i === 1) {
        dayActivities.push({ time: '06:00 AM', activity: 'Start from ' + form.from, cost: 0, icon: '🏠' });
        dayActivities.push({ time: '10:00 AM', activity: 'Travel to ' + form.to + ' (' + distance + ' km)', cost: transportCost, icon: '🚌' });
        dayActivities.push({ time: '02:00 PM', activity: 'Check in to hotel', cost: budget.hotelPerNight, icon: '🏨' });
        dayActivities.push({ time: '04:00 PM', activity: 'Explore local market', cost: Math.round(budget.activityPerDay * 0.3), icon: '🛍️' });
        dayActivities.push({ time: '08:00 PM', activity: 'Dinner at local restaurant', cost: Math.round(budget.foodPerDay * 0.5 * people), icon: '🍽️' });
      } else if (i === days) {
        dayActivities.push({ time: '07:00 AM', activity: 'Breakfast', cost: Math.round(budget.foodPerDay * 0.3 * people), icon: '☕' });
        dayActivities.push({ time: '09:00 AM', activity: 'Last day sightseeing', cost: Math.round(budget.activityPerDay * 0.5), icon: '📸' });
        dayActivities.push({ time: '12:00 PM', activity: 'Check out from hotel', cost: 0, icon: '🏨' });
        dayActivities.push({ time: '02:00 PM', activity: 'Return journey to ' + form.from, cost: 0, icon: '🚌' });
      } else {
        dayActivities.push({ time: '07:00 AM', activity: 'Breakfast at hotel', cost: Math.round(budget.foodPerDay * 0.3 * people), icon: '☕' });
        dayActivities.push({ time: '09:00 AM', activity: 'Visit famous tourist spots', cost: Math.round(budget.activityPerDay * 0.4), icon: '🏛️' });
        dayActivities.push({ time: '01:00 PM', activity: 'Lunch', cost: Math.round(budget.foodPerDay * 0.4 * people), icon: '🍽️' });
        dayActivities.push({ time: '03:00 PM', activity: 'Explore local attractions', cost: Math.round(budget.activityPerDay * 0.4), icon: '🗺️' });
        dayActivities.push({ time: '08:00 PM', activity: 'Dinner', cost: Math.round(budget.foodPerDay * 0.3 * people), icon: '🌙' });
      }
      itinerary.push({ day: i, activities: dayActivities });
    }

    setPlan({
      from: form.from,
      to: form.to,
      days,
      people,
      budgetType: form.budgetType,
      distance,
      transportCost,
      hotelCost,
      foodCost,
      activityCost,
      miscCost,
      totalCost,
      userBudget,
      remaining,
      itinerary,
      budgetColor: budget.color,
    });

    setStep(2);
    setLoading(false);
  };

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
    setNewExpense({ name: '', amount: '' });
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalSpent = expenses.reduce((s, e) => s + parseInt(e.amount || 0), 0);
  const budgetLeft = plan ? plan.userBudget - plan.totalCost - totalSpent : 0;

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();

    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Smart Trip Planner', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Trip Plan: ' + plan.from + ' to ' + plan.to, 105, 27, { align: 'center' });
    doc.setFontSize(10);
    doc.text(plan.days + ' days | ' + plan.people + ' people | ' + plan.budgetType + ' budget', 105, 35, { align: 'center' });

    doc.setFillColor(240, 242, 255);
    doc.roundedRect(14, 48, 182, 30, 4, 4, 'F');
    doc.setTextColor(50, 50, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Distance: ' + plan.distance + ' km', 24, 58);
    doc.text('Transport: Rs. ' + plan.transportCost, 90, 58);
    doc.text('Hotel: Rs. ' + plan.hotelCost, 155, 58);
    doc.text('Food: Rs. ' + plan.foodCost, 24, 68);
    doc.text('Activities: Rs. ' + plan.activityCost, 90, 68);
    doc.text('Total: Rs. ' + plan.totalCost, 155, 68);

    doc.setFillColor(102, 126, 234);
    doc.roundedRect(14, 82, 182, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DAY BY DAY ITINERARY', 105, 90, { align: 'center' });

    let y = 100;
    plan.itinerary.forEach(function(day) {
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(14, y, 182, 8, 2, 2, 'F');
      doc.setTextColor(102, 126, 234);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Day ' + day.day, 20, y + 6);
      y += 12;
      day.activities.forEach(function(act) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 80);
        doc.setFontSize(9);
        doc.text(act.time, 20, y);
        doc.text(act.activity, 55, y);
        if (act.cost > 0) {
          doc.text('Rs. ' + act.cost, 170, y, { align: 'right' });
        }
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 4;
    });

    doc.setFillColor(102, 126, 234);
    doc.rect(0, 278, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Trip Planner | Generated on ' + new Date().toLocaleDateString(), 105, 290, { align: 'center' });

    doc.save('TripPlan_' + plan.from + '_' + plan.to + '.pdf');
  };

  return (
    <div className="planner-wrapper">
      <Navbar />

      <div className="planner-hero">
        <h1>Budget Trip Planner</h1>
        <p>Plan your perfect trip within your budget</p>
        <div className="planner-steps">
          <div className={'planner-step' + (step >= 1 ? ' active' : '')}>1 Plan</div>
          <div className="planner-step-line"></div>
          <div className={'planner-step' + (step >= 2 ? ' active' : '')}>2 Itinerary</div>
          <div className="planner-step-line"></div>
          <div className={'planner-step' + (step >= 3 ? ' active' : '')}>3 Track</div>
        </div>
      </div>

      {step === 1 && (
        <div className="planner-container">
          <div className="planner-form-card">
            <p className="planner-section-label">WHERE ARE YOU GOING?</p>

            <div className="planner-destinations">
              {POPULAR_DESTINATIONS.map(function(d) {
                return (
                  <div
                    key={d.city}
                    className={'dest-chip' + (form.to === d.city ? ' active' : '')}
                    onClick={function() { setForm({ ...form, to: d.city }); }}
                  >
                    <span>{d.emoji}</span>
                    <span>{d.city}</span>
                    <span className="dest-desc">{d.desc}</span>
                  </div>
                );
              })}
            </div>

            <div className="planner-form-row">
              <div className="planner-form-group">
                <label>From City</label>
                <input type="text" name="from" value={form.from} onChange={handleChange} placeholder="Your city" />
              </div>
              <div className="planner-form-group">
                <label>To City</label>
                <input type="text" name="to" value={form.to} onChange={handleChange} placeholder="Destination" />
              </div>
            </div>

            <div className="planner-form-row">
              <div className="planner-form-group">
                <label>Number of Days</label>
                <input type="number" name="days" value={form.days} onChange={handleChange} min="1" max="30" />
              </div>
              <div className="planner-form-group">
                <label>Number of People</label>
                <input type="number" name="people" value={form.people} onChange={handleChange} min="1" max="20" />
              </div>
            </div>

            <div className="planner-form-group">
              <label>Your Total Budget (Rs.) — Optional</label>
              <input type="number" name="totalBudget" value={form.totalBudget} onChange={handleChange} placeholder="Leave empty to auto calculate" />
            </div>

            <p className="planner-section-label" style={{ marginTop: '16px' }}>SELECT BUDGET TYPE</p>
            <div className="budget-preset-row">
              {BUDGET_PRESETS.map(function(b) {
                return (
                  <div
                    key={b.type}
                    className={'budget-preset' + (form.budgetType === b.type ? ' active' : '')}
                    style={form.budgetType === b.type ? { borderColor: b.color, background: b.color + '15' } : {}}
                    onClick={function() { setForm({ ...form, budgetType: b.type }); }}
                  >
                    <span className="bp-icon">{b.icon}</span>
                    <span className="bp-type">{b.type}</span>
                    <span className="bp-hotel">Hotel Rs.{b.hotelPerNight}/night</span>
                    <span className="bp-food">Food Rs.{b.foodPerDay}/day</span>
                  </div>
                );
              })}
            </div>

            <button className="generate-plan-btn" onClick={generatePlan} disabled={loading}>
              {loading ? 'Generating Plan...' : 'Generate My Trip Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && plan && (
        <div className="planner-container">

          <div className="plan-summary-card" style={{ borderTop: '4px solid ' + plan.budgetColor }}>
            <div className="plan-summary-top">
              <div>
                <h2 className="plan-title">{plan.from} to {plan.to}</h2>
                <p className="plan-meta">{plan.days} days | {plan.people} people | {plan.budgetType} | {plan.distance} km</p>
              </div>
              <div className="plan-total-box">
                <span className="plan-total-label">Estimated Cost</span>
                <span className="plan-total-amount">Rs. {plan.totalCost}</span>
                <span className="plan-per-person">Rs. {Math.round(plan.totalCost / plan.people)} per person</span>
              </div>
            </div>

            <div className="plan-cost-row">
              <div className="plan-cost-item">
                <span className="pci-icon">🚌</span>
                <span className="pci-label">Transport</span>
                <span className="pci-value">Rs. {plan.transportCost}</span>
              </div>
              <div className="plan-cost-item">
                <span className="pci-icon">🏨</span>
                <span className="pci-label">Hotel</span>
                <span className="pci-value">Rs. {plan.hotelCost}</span>
              </div>
              <div className="plan-cost-item">
                <span className="pci-icon">🍽️</span>
                <span className="pci-label">Food</span>
                <span className="pci-value">Rs. {plan.foodCost}</span>
              </div>
              <div className="plan-cost-item">
                <span className="pci-icon">🏛️</span>
                <span className="pci-label">Activities</span>
                <span className="pci-value">Rs. {plan.activityCost}</span>
              </div>
              <div className="plan-cost-item">
                <span className="pci-icon">🎒</span>
                <span className="pci-label">Misc</span>
                <span className="pci-value">Rs. {plan.miscCost}</span>
              </div>
            </div>
          </div>

          <div className="itinerary-section">
            <h3 className="itinerary-title">Day by Day Itinerary</h3>
            {plan.itinerary.map(function(day) {
              return (
                <div className="day-card" key={day.day}>
                  <div className="day-header">
                    <div className="day-badge">Day {day.day}</div>
                    <div className="day-cost">
                      Rs. {day.activities.reduce(function(s, a) { return s + a.cost; }, 0)}
                    </div>
                  </div>
                  <div className="day-activities">
                    {day.activities.map(function(act, i) {
                      return (
                        <div className="activity-row" key={i}>
                          <span className="act-icon">{act.icon}</span>
                          <span className="act-time">{act.time}</span>
                          <span className="act-name">{act.activity}</span>
                          {act.cost > 0 && (
                            <span className="act-cost">Rs. {act.cost}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="plan-actions">
            <button className="plan-action-btn secondary" onClick={function() { setStep(1); setPlan(null); }}>
              Edit Plan
            </button>
            <button className="plan-action-btn secondary" onClick={function() { navigate('/search?from=' + plan.from + '&to=' + plan.to); }}>
              Book Transport
            </button>
            <button className="plan-action-btn secondary" onClick={function() { navigate('/explore?city=' + plan.to); }}>
              Explore {plan.to}
            </button>
            <button className="plan-action-btn primary" onClick={function() { setStep(3); }}>
              Track Budget
            </button>
            <button className="plan-action-btn download" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>

        </div>
      )}

      {step === 3 && plan && (
        <div className="planner-container">

          <div className="tracker-header-card">
            <h2>Budget Tracker — {plan.from} to {plan.to}</h2>
            <div className="tracker-summary">
              <div className="tracker-box">
                <span className="tb-label">Total Budget</span>
                <span className="tb-value">Rs. {plan.userBudget}</span>
              </div>
              <div className="tracker-box">
                <span className="tb-label">Planned Cost</span>
                <span className="tb-value">Rs. {plan.totalCost}</span>
              </div>
              <div className="tracker-box">
                <span className="tb-label">Extra Spent</span>
                <span className="tb-value">Rs. {totalSpent}</span>
              </div>
              <div className={'tracker-box' + (budgetLeft >= 0 ? ' green' : ' red')}>
                <span className="tb-label">{budgetLeft >= 0 ? 'Remaining' : 'Over Budget'}</span>
                <span className="tb-value">Rs. {Math.abs(budgetLeft)}</span>
              </div>
            </div>

            <div className="budget-progress-bar">
              <div
                className="budget-progress-fill"
                style={{
                  width: Math.min(((plan.totalCost + totalSpent) / plan.userBudget) * 100, 100) + '%',
                  background: budgetLeft >= 0 ? '#10b981' : '#ef4444',
                }}
              ></div>
            </div>
            <p className="budget-progress-label">
              {Math.round(((plan.totalCost + totalSpent) / plan.userBudget) * 100)}% of budget used
            </p>
          </div>

          <div className="expense-tracker-card">
            <h3>Add Extra Expenses</h3>
            <div className="add-expense-row">
              <input
                type="text"
                placeholder="Expense name (e.g. Shopping)"
                value={newExpense.name}
                onChange={function(e) { setNewExpense({ ...newExpense, name: e.target.value }); }}
              />
              <input
                type="number"
                placeholder="Amount (Rs.)"
                value={newExpense.amount}
                onChange={function(e) { setNewExpense({ ...newExpense, amount: e.target.value }); }}
              />
              <button onClick={addExpense}>Add</button>
            </div>

            {expenses.length > 0 && (
              <div className="expenses-list">
                {expenses.map(function(exp) {
                  return (
                    <div className="expense-item" key={exp.id}>
                      <span className="exp-name">{exp.name}</span>
                      <span className="exp-amount">Rs. {exp.amount}</span>
                      <button className="exp-remove" onClick={function() { removeExpense(exp.id); }}>✕</button>
                    </div>
                  );
                })}
                <div className="expenses-total">
                  <span>Total Extra Expenses</span>
                  <span>Rs. {totalSpent}</span>
                </div>
              </div>
            )}
          </div>

          <div className="plan-actions">
            <button className="plan-action-btn secondary" onClick={function() { setStep(2); }}>
              Back to Itinerary
            </button>
            <button className="plan-action-btn primary" onClick={downloadPDF}>
              Download Full Plan PDF
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default TripPlanner;