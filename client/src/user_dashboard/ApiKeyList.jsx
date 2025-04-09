// client/src/components/dashboard/ApiKeyList.jsx
import React from 'react';

const ApiKeyList = ({ apiKeys, onDelete }) => {
  if (apiKeys.length === 0) {
    return <p>No API keys found. Add your first API key to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Total Tokens</th>
            <th>Available</th>
            <th>Added On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map(key => (
            <tr key={key._id}>
              <td>{key.name}</td>
              <td>
                <span className="text-muted">
                  {key.key.substring(0, 8)}...
                </span>
              </td>
              <td>{key.tokens}</td>
              <td>{key.available}</td>
              <td>{new Date(key.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(key._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApiKeyList;