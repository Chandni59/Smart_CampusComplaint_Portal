import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

const Chatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi there! 👋 I am your Campus Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage.text, messages, user?.id);
      setMessages(prev => [...prev, { role: 'model', text: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Oops! I am having trouble connecting to the server. Please check your Gemini API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>🤖 Campus Assistant</h4>
            <button onClick={() => setIsOpen(false)} className="chatbot-close-btn">✖</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => {
              // Convert markdown bold to html bold, and newlines to <br/>
              const formattedText = msg.text
                .replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>')
                .replace(/\\*(.*?)\\*/g, '<i>$1</i>')
                .replace(/\\n/g, '<br />');

              return (
                <div 
                  key={index} 
                  className={`chatbot-message ${msg.role === 'user' ? 'user-msg' : 'model-msg'}`}
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              );
            })}
            {loading && (
              <div className="chatbot-message model-msg loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSend} disabled={loading}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chatbot-bubble" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};

export default Chatbot;
