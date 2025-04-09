// client/src/components/dashboard/AddApiKeyModal.jsx
import React, { useState } from 'react';

const AddApiKeyModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    tokens: ''
  });
  
  const { name, key, tokens } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    onAdd({
      name,
      key,
      tokens: parseInt(tokens)
    });
  };
  
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New API Key</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">API Key Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="key">API Key</label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  className="form-control"
                  value={key}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tokens">Number of Tokens</label>
                <input
                  type="number"
                  id="tokens"
                  name="tokens"
                  className="form-control"
                  value={tokens}
                  onChange={onChange}
                  required
                  min="1"
                />
              </div>
              <div className="text-right">
                <button type="button" className="btn btn-secondary mr-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Key
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddApiKeyModal;
