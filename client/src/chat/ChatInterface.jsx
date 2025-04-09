// client/src/components/chat/ChatInterface.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import ApiKeySelector from './ApiKeySelector';
import ModelSelector from './ModelSelector';

const ChatInterface = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [tokenUsage, setTokenUsage] = useState({
    prompt: 0,
    completion: 0,
    total: 0
  });
  const [temporaryKeys, setTemporaryKeys] = useState([]);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch user's API keys (both temporary and user-owned) on component mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        // Fetch temporary keys
        const tempKeysRes = await axios.get('/api/users/temporary-keys');
        setTemporaryKeys(tempKeysRes.data);
        
        // Fetch user's own API keys
        const userKeysRes = await axios.get('/api/users/api-keys');
        setUserApiKeys(userKeysRes.data);
        
        // Auto-select a key if available (prioritize temporary keys)
        if (tempKeysRes.data.length > 0) {
          setSelectedApiKey(`temp-${tempKeysRes.data[0]._id}`);
        } else if (userKeysRes.data.length > 0) {
          setSelectedApiKey(`user-${userKeysRes.data[0]._id}`);
        }
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Failed to load your API keys');
      }
    };

    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  // Fetch available models when API key changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedApiKey) return;
      
      try {
        // Extract key type and ID from the selected key
        const [keyType, keyId] = selectedApiKey.split('-');
        
        const res = await axios.get(`/api/llm/available-models?keyType=${keyType}&keyId=${keyId}`);
        setAvailableModels(res.data);
        
        // Auto-select the first model if available
        if (res.data.length > 0) {
          setSelectedModel(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching available models:', err);
        setError('Failed to load available models for this API key');
      }
    };

    fetchModels();
  }, [selectedApiKey]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApiKeyChange = (keyId) => {
    setSelectedApiKey(keyId);
    setSelectedModel(''); // Reset model when API key changes
    setMessages([]); // Clear chat history
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    if (!selectedApiKey) {
      setError('Please select an API key');
      return;
    }
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');
    
    try {
      // Extract key type and ID from the selected key
      const [keyType, keyId] = selectedApiKey.split('-');
      
      // Send message to API
      const res = await axios.post('/api/llm/chat', {
        message: input,
        keyType,
        keyId,
        modelId: selectedModel
      });
      
      // Add assistant response to chat
      const assistantMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update token usage
      setTokenUsage(prev => ({
        prompt: prev.prompt + res.data.usage.promptTokens,
        completion: prev.completion + res.data.usage.completionTokens,
        total: prev.total + res.data.usage.totalTokens
      }));
      
      // If using a temporary key, update its token balance in state
      if (keyType === 'temp') {
        setTemporaryKeys(prev => 
          prev.map(key => 
            key._id === keyId 
              ? { ...key, remainingTokens: res.data.remainingTokens } 
              : key
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get info about selected key
  const getSelectedKeyInfo = () => {
    if (!selectedApiKey) return null;
    
    const [keyType, keyId] = selectedApiKey.split('-');
    
    if (keyType === 'temp') {
      const tempKey = temporaryKeys.find(key => key._id === keyId);
      if (tempKey) {
        return {
          name: tempKey.keyName,
          provider: tempKey.provider,
          type: 'Temporary',
          remainingTokens: tempKey.remainingTokens
        };
      }
    } else if (keyType === 'user') {
      const userKey = userApiKeys.find(key => key._id === keyId);
      if (userKey) {
        return {
          name: userKey.name,
          provider: userKey.provider,
          type: 'Personal',
          remainingTokens: 'N/A (Your own key)'
        };
      }
    }
    
    return null;
  };
  
  const selectedKeyInfo = getSelectedKeyInfo();

  return (
    <div className="py-4 px-0 bg-light min-vh-100" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="row mb-4 g-3" style={{ margin: 0 }}>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3 text-primary">Select API Key</h5>
              <ApiKeySelector 
                temporaryKeys={temporaryKeys} 
                userApiKeys={userApiKeys}
                selectedApiKey={selectedApiKey} 
                onSelectApiKey={handleApiKeyChange} 
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3 text-primary">Select Model</h5>
              <ModelSelector 
                models={availableModels} 
                selectedModel={selectedModel} 
                onSelectModel={handleModelChange} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {selectedKeyInfo && (
        <div className={`card shadow-sm border-0 mb-4 ${selectedKeyInfo.type === 'Temporary' ? 'bg-info bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex flex-wrap gap-4">
              <div>
                <span className="text-muted fs-6">API Key</span>
                <h6 className="mb-0">{selectedKeyInfo.name}</h6>
              </div>
              <div>
                <span className="text-muted fs-6">Provider</span>
                <h6 className="mb-0">{selectedKeyInfo.provider}</h6>
              </div>
              <div>
                <span className="text-muted fs-6">Type</span>
                <h6 className="mb-0">{selectedKeyInfo.type}</h6>
              </div>
              <div>
                <span className="text-muted fs-6">Tokens</span>
                <h6 className="mb-0 d-flex align-items-center">
                  {selectedKeyInfo.remainingTokens}
                  {selectedKeyInfo.type === 'Temporary' && 
                    <span className="badge bg-info ms-2">
                      {parseInt(selectedKeyInfo.remainingTokens).toLocaleString()}
                    </span>
                  }
                </h6>
              </div>
            </div>
            {selectedKeyInfo.type === 'Temporary' && parseInt(selectedKeyInfo.remainingTokens) < 1000 && (
              <div className="badge bg-warning text-dark mt-2 mt-md-0">
                Low token balance
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}
      
      <div className="card shadow border-0 mb-4">
        <div className="card-header bg-primary bg-gradient text-white p-3">
          <h4 className="mb-0">
            <i className="fas fa-comments me-2"></i>
            Chat Session
          </h4>
        </div>
        <div className="card-body p-0">
          <div className="chat-window bg-light" style={{ height: '500px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div className="py-5">
                  <i className="fas fa-comment-dots text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-primary">Start a new conversation</h5>
                  <p className="text-muted">Select an API key and model, then send a message to begin</p>
                </div>
              </div>
            ) : (
              <div className="messages-container p-3">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))}
                {isLoading && (
                  <div className="typing-indicator my-3 ms-4">
                    <div className="typing-indicator-bubble">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        <div className="card-footer border-top p-3 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <textarea
                className="form-control border-end-0 shadow-none"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading || !selectedApiKey || !selectedModel}
                rows="2"
                style={{ resize: 'none', borderRadius: '0.375rem 0 0 0.375rem' }}
              ></textarea>
              <button 
                className="btn btn-primary px-4"
                type="submit" 
                disabled={isLoading || !selectedApiKey || !selectedModel}
                style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
            <div className="form-text text-muted small mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </form>
        </div>
      </div>
      
      <div className="card shadow border-0">
        <div className="card-header bg-info bg-gradient text-white p-3">
          <h5 className="mb-0">
            <i className="fas fa-chart-bar me-2"></i>
            Token Usage Statistics
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center hover-shadow">
                <div className="card-body py-4">
                  <div className="icon-circle bg-primary bg-opacity-10 text-primary mb-3">
                    <i className="fas fa-file-import"></i>
                  </div>
                  <h5 className="card-title">Prompt Tokens</h5>
                  <p className="display-5 fw-bold text-primary mb-0">{tokenUsage.prompt.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center hover-shadow">
                <div className="card-body py-4">
                  <div className="icon-circle bg-success bg-opacity-10 text-success mb-3">
                    <i className="fas fa-file-export"></i>
                  </div>
                  <h5 className="card-title">Completion Tokens</h5>
                  <p className="display-5 fw-bold text-success mb-0">{tokenUsage.completion.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center hover-shadow">
                <div className="card-body py-4">
                  <div className="icon-circle bg-info bg-opacity-10 text-info mb-3">
                    <i className="fas fa-calculator"></i>
                  </div>
                  <h5 className="card-title">Total Tokens</h5>
                  <p className="display-5 fw-bold text-info mb-0">{tokenUsage.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for the component */}
      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-3px);
          transition: transform 0.3s ease;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .icon-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          font-size: 1.5rem;
        }
        
        .typing-indicator {
          display: flex;
          align-items: flex-end;
        }
        
        .typing-indicator-bubble {
          background-color: #e0e0e0;
          padding: 12px 18px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          margin-right: 10px;
        }
        
        .typing-indicator-bubble span {
          height: 8px;
          width: 8px;
          background-color: #777;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          animation: typing 1s infinite ease-in-out;
        }
        
        .typing-indicator-bubble span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator-bubble span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator-bubble span:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }
        
        @keyframes typing {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;