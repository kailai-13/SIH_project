// src/components/MoodTracker.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './MoodTracker.css';

const MoodTracker = ({ user }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#4CAF50' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: '#2196F3' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#9E9E9E' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: '#FF9800' },
    { id: 'stressed', label: 'Stressed', emoji: '😫', color: '#F44336' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#673AB7' }
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await apiService.getMoodHistory();
      setMoodHistory(response.entries || []);
    } catch (error) {
      console.error('Failed to fetch mood history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.addMoodEntry({
        mood: selectedMood,
        note: note.trim() || null
      });

      setSuccess('Mood logged successfully! Thank you for checking in.');
      setSelectedMood('');
      setNote('');
      
      // Refresh mood history
      await fetchMoodHistory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Failed to log mood:', error);
      setError(error.message || 'Failed to log mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodDistribution = () => {
    const distribution = moods.map(mood => ({
      ...mood,
      count: moodHistory.filter(entry => entry.mood === mood.id).length
    }));
    
    const totalEntries = moodHistory.length;
    return distribution.map(mood => ({
      ...mood,
      percentage: totalEntries > 0 ? ((mood.count / totalEntries) * 100).toFixed(1) : 0
    }));
  };

  const getRecentMoodTrend = () => {
    const recentEntries = moodHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 7);
    
    if (recentEntries.length === 0) return null;
    
    const moodValues = {
      happy: 5,
      calm: 4,
      neutral: 3,
      tired: 2,
      stressed: 1,
      anxious: 1
    };
    
    const avgMood = recentEntries.reduce((sum, entry) => 
      sum + (moodValues[entry.mood] || 3), 0) / recentEntries.length;
    
    if (avgMood >= 4) return { trend: 'positive', message: 'You\'ve been feeling great lately! 😊' };
    if (avgMood >= 3) return { trend: 'neutral', message: 'Your mood has been stable. 😐' };
    return { trend: 'concerning', message: 'Consider reaching out for support. 💙' };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const moodDistribution = getMoodDistribution();
  const totalLogs = moodHistory.length;
  const recentTrend = getRecentMoodTrend();

  return (
    <div className="mood-container">
      <div className="mood-header">
        <h2>Daily Mood Check-in</h2>
        <p>Track your mood patterns to better understand your emotional well-being.</p>
        
        <div className="mood-tabs">
          <button
            className={`tab-btn ${!showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(false)}
          >
            Log Mood
          </button>
          <button
            className={`tab-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(true)}
          >
            History ({totalLogs})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <strong>Success:</strong> {success}
        </div>
      )}

      {!showHistory ? (
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
                  style={{ 
                    borderColor: selectedMood === mood.id ? mood.color : '#ddd',
                    backgroundColor: selectedMood === mood.id ? `${mood.color}20` : '#fff'
                  }}
                  disabled={loading}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
            
            <div className="form-group">
              <label htmlFor="note">
                Optional Note 
                <span className="optional-text">(What's influencing your mood?)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any details about your mood..."
                disabled={loading}
                maxLength="500"
              />
              <div className="char-count">{note.length}/500</div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={!selectedMood || loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Logging...
                </span>
              ) : (
                'Log Mood'
              )}
            </button>
          </form>
          
          {totalLogs > 0 && (
            <div className="mood-summary">
              <h3>Your Mood Summary</h3>
              {recentTrend && (
                <div className={`trend-card ${recentTrend.trend}`}>
                  <p>{recentTrend.message}</p>
                </div>
              )}
              
              <div className="quick-stats">
                <div className="stat">
                  <span className="stat-number">{totalLogs}</span>
                  <span className="stat-label">Total Check-ins</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {moodHistory.length > 0 ? Math.ceil(moodHistory.length / 7) : 0}
                  </span>
                  <span className="stat-label">Weeks Tracked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mood-history">
          {totalLogs > 0 ? (
            <>
              <div className="mood-chart">
                <h3>Your Mood Distribution</h3>
                <div className="chart-bars">
                  {moodDistribution.map(mood => (
                    <div key={mood.id} className="chart-bar-container">
                      <div className="chart-bar-label">
                        <span className="mood-emoji-small">{mood.emoji}</span>
                        <span className="mood-count">{mood.count}</span>
                        <span className="mood-percentage">({mood.percentage}%)</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className="chart-bar-fill"
                          style={{
                            height: totalLogs > 0 ? `${(mood.count / Math.max(...moodDistribution.map(m => m.count))) * 100}%` : '0%',
                            backgroundColor: mood.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="history-timeline">
                <h3>Recent Entries</h3>
                <div className="timeline-list">
                  {moodHistory
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10)
                    .map(entry => {
                      const mood = moods.find(m => m.id === entry.mood);
                      return (
                        <div key={entry.id} className="timeline-entry">
                          <div className="timeline-mood">
                            <span className="timeline-emoji">{mood?.emoji}</span>
                            <span className="timeline-mood-name">{mood?.label}</span>
                          </div>
                          <div className="timeline-content">
                            {entry.note && <p className="timeline-note">"{entry.note}"</p>}
                            <div className="timeline-date">{formatDate(entry.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No mood data yet</h3>
              <p>Start tracking your mood to see patterns and insights!</p>
              <button 
                onClick={() => setShowHistory(false)}
                className="action-btn"
              >
                Log Your First Mood
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
