import React from 'react';

const ApiKeySelector = ({ temporaryKeys, userApiKeys, selectedApiKey, onSelectApiKey }) => {
  return (
    <div className="mb-4">
      <label htmlFor="apiKeySelect" className="block text-sm font-medium text-gray-700 mb-1">
        Select API Key
      </label>
      <select
        id="apiKeySelect"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        value={selectedApiKey}
        onChange={(e) => onSelectApiKey(e.target.value)}
      >
        <option value="">Select an API key</option>
        
        {temporaryKeys.length > 0 && (
          <optgroup label="Temporary Keys">
            {temporaryKeys.map((key) => (
              <option key={`temp-${key._id}`} value={`temp-${key._id}`}>
                {key.name} ({key.provider}) - {key.remainingTokens} tokens
              </option>
            ))}
          </optgroup>
        )}
        
        {userApiKeys.length > 0 && (
          <optgroup label="Your API Keys">
            {userApiKeys.map((key) => (
              <option key={`user-${key._id}`} value={`user-${key._id}`}>
                {key.name} ({key.provider})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
};

export default ApiKeySelector;