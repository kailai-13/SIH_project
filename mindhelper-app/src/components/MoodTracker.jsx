// src/components/MoodTracker.jsx
import React, { useState } from 'react';
import './MoodTracker.css';

const MoodTracker = ({ addMoodLog, moodLogs }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#4CAF50' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: '#2196F3' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#9E9E9E' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: '#FF9800' },
    { id: 'stressed', label: 'Stressed', emoji: '😫', color: '#F44336' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#673AB7' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMood) {
      addMoodLog({ mood: selectedMood, note });
      setSelectedMood('');
      setNote('');
      setSubmitted(true);
      
      // Reset submitted status after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  // Calculate mood distribution for the chart
  const moodDistribution = moods.map(mood => ({
    ...mood,
    count: moodLogs.filter(log => log.mood === mood.id).length
  }));

  const totalLogs = moodLogs.length;

  return (
    <div className="mood-container">
      <h2>Daily Mood Check-in</h2>
      <p>Track your mood patterns to better understand your emotional well-being.</p>
      
      <div className="mood-tracker">
        <form className="mood-form" onSubmit={handleSubmit}>
          <h3>How are you feeling today?</h3>
          
          <div className="mood-options">
            {moods.map(mood => (
              <button
                key={mood.id}
                type="button"
                className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.id)}
                style={{ borderColor: selectedMood === mood.id ? mood.color : '#ddd' }}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>
          
          <div className="form-group">
            <label htmlFor="note">Optional Note (What's influencing your mood?)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any details about your mood..."
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={!selectedMood}>
            Log Mood
          </button>
          
          {submitted && (
            <div className="success-message">
              Mood logged successfully! Thank you for checking in.
            </div>
          )}
        </form>
        
        <div className="mood-chart">
          <h3>Your Mood History</h3>
          {totalLogs > 0 ? (
            <>
              <div className="chart-bars">
                {moodDistribution.map(mood => (
                  <div key={mood.id} className="chart-bar-container">
                    <div className="chart-bar-label">
                      <span className="mood-emoji-small">{mood.emoji}</span>
                      <span>{mood.count}</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{
                          height: totalLogs > 0 ? `${(mood.count / totalLogs) * 100}%` : '0%',
                          backgroundColor: mood.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="chart-summary">
                You've logged {totalLogs} mood{totalLogs !== 1 ? 's' : ''} total.
              </p>
            </>
          ) : (
            <p className="no-data">No mood data yet. Check in to see your mood patterns!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;