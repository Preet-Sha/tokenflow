// client/src/components/chat/ApiKeySelector.jsx
import React from 'react';

const ApiKeySelector = ({ temporaryKeys, userApiKeys, selectedApiKey, onSelectApiKey }) => {
  const hasKeys = temporaryKeys.length > 0 || userApiKeys.length > 0;
  
  if (!hasKeys) {
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">No API Keys Available</h5>
          <p className="card-text">You don't have any API keys available. Add your own keys or purchase temporary tokens from the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Select API Key</h5>
      </div>
      <div className="card-body">
        <select 
          className="form-control"
          value={selectedApiKey}
          onChange={e => onSelectApiKey(e.target.value)}
        >
          <option value="">-- Select an API Key --</option>
          
          {temporaryKeys.length > 0 && (
            <optgroup label="Temporary API Keys">
              {temporaryKeys.map(key => (
                <option key={`temp-${key._id}`} value={`temp-${key._id}`}>
                  {key.keyName} ({key.provider}) - {key.remainingTokens} tokens left
                </option>
              ))}
            </optgroup>
          )}
          
          {userApiKeys.length > 0 && (
            <optgroup label="Your API Keys">
              {userApiKeys.map(key => (
                <option key={`user-${key._id}`} value={`user-${key._id}`}>
                  {key.name} ({key.provider}) - Your Key
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    </div>
  );
};

export default ApiKeySelector;