import React, { useState } from 'react'

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week')
  
  // Mock data for admin dashboard
  const stats = {
    totalStudents: 1247,
    activeChats: 23,
    bookingsToday: 8,
    moodEntries: 156,
    averageMoodScore: 3.2,
    criticalAlerts: 3
  }

  const recentBookings = [
    { id: 1, student: 'John D.', counselor: 'Dr. Wilson', date: '2025-09-26', time: '10:00 AM', status: 'confirmed' },
    { id: 2, student: 'Jane S.', counselor: 'Dr. Chen', date: '2025-09-26', time: '2:00 PM', status: 'pending' },
    { id: 3, student: 'Mike J.', counselor: 'Dr. Johnson', date: '2025-09-27', time: '11:00 AM', status: 'confirmed' },
    { id: 4, student: 'Sara L.', counselor: 'Dr. Martinez', date: '2025-09-27', time: '3:00 PM', status: 'cancelled' }
  ]

  const moodTrends = [
    { date: 'Mon', happy: 45, neutral: 32, stressed: 23 },
    { date: 'Tue', happy: 38, neutral: 35, stressed: 27 },
    { date: 'Wed', happy: 42, neutral: 28, stressed: 30 },
    { date: 'Thu', happy: 35, neutral: 40, stressed: 25 },
    { date: 'Fri', happy: 48, neutral: 30, stressed: 22 }
  ]

  const criticalAlerts = [
    { id: 1, student: 'Anonymous Student #1', type: 'Crisis Keywords Detected', time: '2 hours ago', severity: 'high' },
    { id: 2, student: 'Anonymous Student #2', type: 'Repeated Sad Mood Entries', time: '1 day ago', severity: 'medium' },
    { id: 3, student: 'Anonymous Student #3', type: 'Missed Counseling Sessions', time: '2 days ago', severity: 'medium' }
  ]

  const chatAnalytics = {
    totalSessions: 342,
    averageLength: '12 min',
    commonTopics: [
      { topic: 'Anxiety', count: 89 },
      { topic: 'Stress', count: 76 },
      { topic: 'Depression', count: 54 },
      { topic: 'Sleep Issues', count: 43 },
      { topic: 'Academic Pressure', count: 38 }
    ]
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Monitor student mental health metrics, manage resources, and track platform usage. 
          All student data is anonymized and HIPAA compliant.
        </p>
        <div className="dashboard-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Key Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.totalStudents.toLocaleString()}</div>
          <div className="admin-stat-label">Total Students</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.activeChats}</div>
          <div className="admin-stat-label">Active Chats</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.bookingsToday}</div>
          <div className="admin-stat-label">Bookings Today</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.moodEntries}</div>
          <div className="admin-stat-label">Mood Entries</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.averageMoodScore}/5</div>
          <div className="admin-stat-label">Avg Mood Score</div>
        </div>
        <div className="admin-stat-card critical">
          <div className="admin-stat-number">{stats.criticalAlerts}</div>
          <div className="admin-stat-label">Critical Alerts</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recent Bookings */}
        <div className="card">
          <h3>Recent Counseling Bookings</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Counselor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.student}</td>
                    <td>{booking.counselor}</td>
                    <td>{booking.date} {booking.time}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat Analytics */}
        <div className="card">
          <h3>AI Chat Analytics</h3>
          <div className="chat-stats">
            <div className="stat-row">
              <span>Total Sessions:</span>
              <strong>{chatAnalytics.totalSessions}</strong>
            </div>
            <div className="stat-row">
              <span>Average Length:</span>
              <strong>{chatAnalytics.averageLength}</strong>
            </div>
          </div>
          <h4>Common Topics</h4>
          <div className="topic-list">
            {chatAnalytics.commonTopics.map((topic, index) => (
              <div key={index} className="topic-item">
                <span className="topic-name">{topic.topic}</span>
                <span className="topic-count">{topic.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Analytics */}
      <div className="card">
        <h3>Student Mood Analytics</h3>
        <div className="mood-analytics">
          <div className="chart-placeholder">
            📊 Weekly Mood Trends Chart
            <br />
            <small>Integration point for Chart.js or D3.js visualization</small>
          </div>
          <div className="mood-summary">
            <div className="mood-stat">
              <span className="mood-emoji">😊</span>
              <div>
                <div className="mood-percentage">42%</div>
                <div className="mood-description">Happy/Positive</div>
              </div>
            </div>
            <div className="mood-stat">
              <span className="mood-emoji">😐</span>
              <div>
                <div className="mood-percentage">33%</div>
                <div className="mood-description">Neutral</div>
              </div>
            </div>
            <div className="mood-stat">
              <span className="mood-emoji">😰</span>
              <div>
                <div className="mood-percentage">25%</div>
                <div className="mood-description">Stressed/Anxious</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="card critical-alerts">
          <h3>🚨 Critical Alerts</h3>
          <div className="alerts-list">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className="alert-content">
                  <h4>{alert.type}</h4>
                  <p>{alert.student}</p>
                  <small>{alert.time}</small>
                </div>
                <div className="alert-actions">
                  <button className="btn btn-primary">Review</button>
                  <button className="btn btn-outline">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
