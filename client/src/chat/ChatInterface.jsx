import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import ApiKeySelector from './ApiKeySelector';

const ChatInterface = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [tokenUsage, setTokenUsage] = useState({
    prompt: 0,
    completion: 0,
    total: 0
  });
  const [temporaryKeys, setTemporaryKeys] = useState([]);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const tempKeysRes = await axios.get('/api/users/temporary-keys');
        setTemporaryKeys(tempKeysRes.data);

        const userKeysRes = await axios.get('/api/users/api-keys');
        setUserApiKeys(userKeysRes.data);

        // Select first available key
        if (tempKeysRes.data.length > 0) {
          const key = tempKeysRes.data[0];
          setSelectedApiKey(`temp-${key._id}`);
        } else if (userKeysRes.data.length > 0) {
          const key = userKeysRes.data[0];
          setSelectedApiKey(`user-${key._id}`);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApiKeyChange = (keyId) => {
    setSelectedApiKey(keyId);
    setMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!input.trim()) return;
    if (!selectedApiKey) {
      setError('Please select an API key');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      // Extract key type and ID from selectedApiKey
      const [keyType, keyId] = selectedApiKey.split('-');
      
      if (!keyType || !keyId) {
        throw new Error('Invalid API key selection');
      }

      // Get the actual key data to extract model name
      let modelId = '';
      if (keyType === 'temp') {
        const keyData = temporaryKeys.find(k => k._id === keyId);
        if (!keyData) throw new Error('Selected temporary key not found');
        modelId = keyData.name; // Use keyName as modelId for temp keys
      } else if (keyType === 'user') {
        const keyData = userApiKeys.find(k => k._id === keyId);
        if (!keyData) throw new Error('Selected user key not found');
        modelId = keyData.provider; // Use name as modelId for user keys
      } else {
        throw new Error('Unknown key type');
      }

      if (!modelId) {
        throw new Error('Could not determine model ID from key');
      }

      // Make API request with all required fields
      const res = await axios.post('/api/llm/chat', {
        message: input,
        keyType,
        keyId,
        modelId
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      setTokenUsage(prev => ({
        prompt: prev.prompt + res.data.usage.promptTokens,
        completion: prev.completion + res.data.usage.completionTokens,
        total: prev.total + res.data.usage.totalTokens
      }));

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

  const getSelectedKeyInfo = () => {
    if (!selectedApiKey) return null;

    const [keyType, keyId] = selectedApiKey.split('-');

    if (keyType === 'temp') {
      const tempKey = temporaryKeys.find(key => key._id === keyId);
      if (tempKey) {
        return {
          name: tempKey.name,
          provider: tempKey.provider,
          type: 'Temporary',
          remainingTokens: tempKey.remainingTokens
        };
      }
    } else if (keyType === 'user') {
      const userKey = userApiKeys.find(key => key._id === keyId);
      if (userKey) {
        return {
          name: userKey.provider,
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
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 overflow-y-auto">
        <div className="mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Model Selection</h3>
        </div>
        
        <ApiKeySelector
          temporaryKeys={temporaryKeys}
          userApiKeys={userApiKeys}
          selectedApiKey={selectedApiKey}
          onSelectApiKey={handleApiKeyChange}
        />
        
        {selectedKeyInfo && (
          <div className="bg-white rounded-lg p-3 my-2 shadow-sm">
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-gray-600">Model:</span>
              <span className="text-gray-800">{selectedKeyInfo.provider}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-gray-600">Provider:</span>
              <span className="text-gray-800">{selectedKeyInfo.provider}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-gray-600">Type:</span>
              <span className="text-gray-800">{selectedKeyInfo.type}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-gray-600">Tokens:</span>
              <span className="text-gray-800">{selectedKeyInfo.remainingTokens}</span>
            </div>
          </div>
        )}
        
        <div className="mt-auto bg-white rounded-lg p-3 shadow-sm">
          <h4 className="text-base font-medium text-gray-800 mb-2">Token Usage</h4>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Prompt:</span>
            <span className="font-medium text-gray-800">{tokenUsage.prompt}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Completion:</span>
            <span className="font-medium text-gray-800">{tokenUsage.completion}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-gray-800">{tokenUsage.total}</span>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {error && (
          <div className="bg-red-50 text-red-700 p-2 mx-4 mt-2 rounded-md text-center text-sm">
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="text-5xl mb-4 text-green-600">
                <i className="fas fa-comment-dots"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">How can I help you today?</h2>
              <p className="text-base max-w-md">Select a model from the sidebar to begin chatting</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex p-6 bg-gray-50">
                  <div className="w-8 h-8 flex-shrink-0 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                    <i className="fas fa-robot text-sm"></i>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">Assistant</div>
                    </div>
                    <div className="mt-1 text-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
            <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
              <textarea
                className="w-full px-3 py-2 border-none outline-none resize-none text-base"
                placeholder="Message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading || !selectedApiKey}
                rows="1"
              ></textarea>
              <button
                className={`absolute right-2 bottom-2 w-8 h-8 rounded-md flex items-center justify-center text-white ${
                  isLoading || !selectedApiKey ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
                type="submit"
                disabled={isLoading || !selectedApiKey}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <i className="fas fa-paper-plane text-sm"></i>
                )}
              </button>
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;