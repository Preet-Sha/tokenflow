import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ApiKeyList from './ApiKeyList';
import AddApiKeyModal from './AddApiKeyModal';
import PurchaseHistory from './PurchaseHistory';
import SalesHistory from './SalesHistory';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [apiKeys, setApiKeys] = useState([]);
  const [temporaryTokens, setTemporaryTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, apiKeysRes] = await Promise.all([
          axios.get('/api/users/profile'),
          axios.get('/api/users/api-keys')
        ]);
        
        setApiKeys(apiKeysRes.data);
        setTemporaryTokens(userRes.data.temporaryTokens || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addApiKey = async (newApiKey) => {
    try {
      const res = await axios.post('/api/users/api-keys', newApiKey);
      setApiKeys([...apiKeys, res.data.apiKey]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding API key:', err);
    }
  };

  const deleteApiKey = async (id) => {
    try {
      await axios.delete(`/api/users/api-keys/${id}`);
      setApiKeys(apiKeys.filter(key => key._id !== id));
    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Dashboard</h2>
          <p className="lead">Welcome, {user?.name}</p>
        </div>
        <div className="col-md-4 text-right">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            Add New API Key
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4>Your API Keys</h4>
            </div>
            <div className="card-body">
              <ApiKeyList apiKeys={apiKeys} onDelete={deleteApiKey} />
            </div>
          </div>
        </div>
      </div>

      {temporaryTokens.length > 0 && (
        <div className="row">
          <div className="col-md-12">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h4>Your Purchased Tokens</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>API Key Name</th>
                        <th>Tokens Remaining</th>
                        <th>Purchased Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {temporaryTokens.map(token => (
                        <tr key={token._id}>
                          <td>{token.apiKeyName}</td>
                          <td>{token.tokensRemaining}</td>
                          <td>{new Date(token.purchasedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h4>Purchase History</h4>
            </div>
            <div className="card-body">
              <PurchaseHistory />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h4>Sales History</h4>
            </div>
            <div className="card-body">
              <SalesHistory />
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddApiKeyModal 
          onAdd={addApiKey} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;