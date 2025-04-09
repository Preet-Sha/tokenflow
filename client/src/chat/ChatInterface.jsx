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
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <ApiKeySelector 
            temporaryKeys={temporaryKeys} 
            userApiKeys={userApiKeys}
            selectedApiKey={selectedApiKey} 
            onSelectApiKey={handleApiKeyChange} 
          />
        </div>
        <div className="col-md-6">
          <ModelSelector 
            models={availableModels} 
            selectedModel={selectedModel} 
            onSelectModel={handleModelChange} 
          />
        </div>
      </div>
      
      {selectedKeyInfo && (
        <div className={`alert ${selectedKeyInfo.type === 'Temporary' ? 'alert-info' : 'alert-success'}`}>
          <strong>API Key:</strong> {selectedKeyInfo.name} | 
          <strong> Provider:</strong> {selectedKeyInfo.provider} | 
          <strong> Type:</strong> {selectedKeyInfo.type} | 
          <strong> Tokens:</strong> {selectedKeyInfo.remainingTokens}
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4>Chat</h4>
        </div>
        <div className="card-body chat-window">
          {messages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>Start a conversation</h5>
              <p>Select an API key and model, then send a message to begin</p>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="card-footer">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <textarea
                className="form-control"
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
              ></textarea>
              <div className="input-group-append">
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={isLoading || !selectedApiKey || !selectedModel}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5>Token Usage</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Prompt Tokens</h5>
                  <p className="card-text display-4">{tokenUsage.prompt}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Completion Tokens</h5>
                  <p className="card-text display-4">{tokenUsage.completion}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Tokens</h5>
                  <p className="card-text display-4">{tokenUsage.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;