// src/components/OllamaChatbot.jsx
import React, { useState } from 'react';
import './OllamaChatbot.css';

const OllamaChatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your wellness assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Sample responses for demo purposes
  const botResponses = {
    'stress': "I understand you're feeling stressed. Try taking a few deep breaths and breaking your tasks into smaller, manageable steps. Would you like to try a quick relaxation exercise?",
    'anxiety': "Anxiety can be challenging. Remember to focus on your breathing. The 4-7-8 technique (inhale for 4, hold for 7, exhale for 8) can help calm your nervous system.",
    'motivation': "When motivation is low, start with a small, achievable task. Completing it can create momentum. Also, remember why this work matters to you personally.",
    'default': "I'm here to support you with stress, anxiety, or motivation challenges. Could you tell me a bit more about what you're experiencing?"
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, text: inputText, sender: 'user' };
    setMessages([...messages, newUserMessage]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      let response = botResponses.default;
      
      // Simple keyword matching for demo
      const userText = inputText.toLowerCase();
      if (userText.includes('stress')) response = botResponses.stress;
      else if (userText.includes('anxious') || userText.includes('anxiety')) response = botResponses.anxiety;
      else if (userText.includes('motivation') || userText.includes('unmotivated')) response = botResponses.motivation;
      
      const newBotMessage = { id: messages.length + 2, text: response, sender: 'bot' };
      setMessages(prev => [...prev, newBotMessage]);
    }, 1000);
    
    setInputText('');
  };

  return (
    <div className="chatbot-container">
      <h2>AI Wellness Assistant</h2>
      <p>Chat with our AI assistant for support with stress, anxiety, and motivation.</p>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      
      <div className="chat-suggestions">
        <p>Try asking about:</p>
        <button onClick={() => setInputText("I'm feeling stressed about exams")}>Stress</button>
        <button onClick={() => setInputText("I'm anxious about presentations")}>Anxiety</button>
        <button onClick={() => setInputText("I need motivation to study")}>Motivation</button>
      </div>
    </div>
  );
};

export default OllamaChatbot;