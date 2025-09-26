// src/components/OllamaChatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import './OllamaChatbot.css';

const OllamaChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start chat session when component mounts
    startChatSession();
  }, []);

  const startChatSession = async () => {
    try {
      setLoading(true);
      const result = await apiService.startChat();
      setSessionId(result.session_id);
      
      setMessages([{
        id: 1,
        text: result.message,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error starting chat:', error);
      setMessages([{
        id: 1,
        text: "Hello! I'm here to support you. How can I help you today?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || loading) return;
    
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const result = await apiService.sendMessage(inputText, sessionId);
      
      const botMessage = {
        id: messages.length + 2,
        text: result.response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        analysis: {
          emotion: result.emotion_detected,
          confidence: result.emotion_confidence,
          risk: result.risk_level,
          keywords: result.crisis_keywords
        }
      };

      setMessages(prev => [...prev, botMessage]);
      setAnalysis(botMessage.analysis);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    "I'm feeling anxious about exams",
    "I've been really stressed lately",
    "I'm having trouble sleeping",
    "I feel lonely and isolated"
  ];

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AI Wellness Assistant</h2>
        <p>Confidential support for stress, anxiety, and mental wellness</p>
        {sessionId && (
          <div className="session-info">
            Session Active • {messages.length} messages
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-time">
              {message.timestamp}
            </div>
            {message.analysis && message.sender === 'bot' && (
              <div className="message-analysis">
                <span className={`risk-badge risk-${message.analysis.risk}`}>
                  {message.analysis.risk} risk
                </span>
                <span className="emotion-badge">
                  {message.analysis.emotion} ({Math.round(message.analysis.confidence * 100)}%)
                </span>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="chat-input">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send)"
            disabled={loading}
            rows={2}
          />
          <button 
            onClick={handleSendMessage}
            disabled={loading || !inputText.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
        
        <div className="quick-suggestions">
          <p>Quick suggestions:</p>
          <div className="suggestion-buttons">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputText(suggestion)}
                disabled={loading}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {analysis && analysis.risk !== 'low' && (
        <div className={`safety-alert alert-${analysis.risk}`}>
          <h4>Safety Notice</h4>
          <p>
            {analysis.risk === 'critical' 
              ? "We've detected concerning content. Please reach out to emergency services if you're in immediate danger."
              : "We've detected some concerning content. Remember that professional help is available."}
          </p>
          {analysis.keywords.length > 0 && (
            <p>Concerning phrases: {analysis.keywords.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OllamaChatbot;