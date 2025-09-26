import React, { useState, useEffect } from 'react'

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState('')
  const [moodNote, setMoodNote] = useState('')
  const [moodHistory, setMoodHistory] = useState([
    { id: 1, date: '2025-09-25', mood: 'happy', note: 'Great day! Aced my exam', energy: 4 },
    { id: 2, date: '2025-09-24', mood: 'stressed', note: 'Lots of assignments due', energy: 2 },
    { id: 3, date: '2025-09-23', mood: 'anxious', note: 'Worried about presentation', energy: 3 },
    { id: 4, date: '2025-09-22', mood: 'happy', note: 'Spent time with friends', energy: 5 },
    { id: 5, date: '2025-09-21', mood: 'neutral', note: 'Regular day, nothing special', energy: 3 }
  ])

  const moods = [
    { id: 'very-happy', emoji: '😄', label: 'Very Happy', color: '#10b981' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#34d399' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
    { id: 'stressed', emoji: '😤', label: 'Stressed', color: '#f59e0b' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#f97316' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#ef4444' },
    { id: 'very-sad', emoji: '😭', label: 'Very Sad', color: '#dc2626' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedMood) return

    const newEntry = {
      id: moodHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      note: moodNote,
      energy: Math.floor(Math.random() * 5) + 1
    }

    setMoodHistory([newEntry, ...moodHistory])
    setSelectedMood('')
    setMoodNote('')
    alert('Mood logged successfully! Keep tracking to see your patterns.')
  }

  const getMoodStats = () => {
    const last7Days = moodHistory.slice(0, 7)
    const moodCounts = {}
    last7Days.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    })
    return moodCounts
  }

  return (
    <div className="mood-tracker-page">
      <div className="page-header">
        <h1 className="page-title">Mood Tracker</h1>
        <p className="page-subtitle">
          Track your daily mood to identify patterns and improve your mental well-being. 
          Regular mood tracking helps you understand your emotional patterns and triggers.
        </p>
      </div>

      <div className="grid grid-2">
        {/* Mood Entry Form */}
        <div className="card">
          <h3>How are you feeling today?</h3>
          <form onSubmit={handleSubmit}>
            <div className="mood-selector">
              {moods.map(mood => (
                <div
                  key={mood.id}
                  className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <div className="mood-emoji">{mood.emoji}</div>
                  <div className="mood-label">{mood.label}</div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">What's happening? (Optional)</label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                className="form-textarea"
                placeholder="Share what's affecting your mood today..."
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={!selectedMood}>
              Log My Mood
            </button>
          </form>
        </div>

        {/* Weekly Summary */}
        <div className="card">
          <h3>This Week's Summary</h3>
          <div className="mood-chart-placeholder">
            <div className="chart-placeholder">
              📊 Mood Chart Visualization
              <br />
              <small>Connect to Chart.js or similar library for interactive charts</small>
            </div>
            
            <div className="mood-stats">
              <h4>Mood Distribution (Last 7 days)</h4>
              {Object.entries(getMoodStats()).map(([moodId, count]) => {
                const moodInfo = moods.find(m => m.id === moodId)
                return (
                  <div key={moodId} className="mood-stat-item">
                    <span>{moodInfo?.emoji} {moodInfo?.label}</span>
                    <span>{count} days</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mood History */}
      <div className="card">
        <h3>Recent Mood Entries</h3>
        <div className="mood-history">
          {moodHistory.slice(0, 10).map(entry => {
            const moodInfo = moods.find(m => m.id === entry.mood)
            return (
              <div key={entry.id} className="mood-history-item">
                <div className="mood-history-date">
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="mood-history-mood">
                  <span className="mood-emoji">{moodInfo?.emoji}</span>
                  <span className="mood-label">{moodInfo?.label}</span>
                </div>
                <div className="mood-history-note">
                  {entry.note || 'No note added'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights & Tips */}
      <div className="card">
        <h3>💡 Insights & Tips</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Tracking Tip</h4>
            <p>Try to log your mood at the same time each day for more accurate patterns.</p>
          </div>
          <div className="insight-card">
            <h4>📈 Pattern Recognition</h4>
            <p>Look for triggers that consistently affect your mood and plan accordingly.</p>
          </div>
          <div className="insight-card">
            <h4>🌟 Positive Reinforcement</h4>
            <p>Celebrate the activities and people that consistently improve your mood.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoodTracker
