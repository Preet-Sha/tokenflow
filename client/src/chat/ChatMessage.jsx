// client/src/components/chat/ChatMessage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-container ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className={`message ${isUser ? 'user' : 'assistant'}`}>
        <div className="message-header">
          <strong>{isUser ? 'You' : 'Assistant'}</strong>
          <small>{formatTime(timestamp)}</small>
        </div>
        <div className="message-content">
          {isUser ? (
            <p>{content}</p>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
