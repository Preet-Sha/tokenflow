import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  FiKey, FiShoppingCart, FiTrendingUp, FiMenu, FiX, 
  FiUser, FiSettings, FiLogOut, FiPieChart, FiDollarSign,
  FiCreditCard, FiShield, FiMessageCircle, FiCalendar, FiDownload,
  FiHome, FiMessageSquare, FiShoppingBag
} from 'react-icons/fi';
import { 
  BsGraphUp, BsWallet2, BsLightningCharge, BsArrowUpRight,
  BsArrowDownRight
} from 'react-icons/bs';
import { RiRocketLine } from 'react-icons/ri';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import CountUp from 'react-countup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-circular-progressbar/dist/styles.css';
import ApiKeyList from './ApiKeyList';
import AddApiKeyModal from './AddApiKeyModal';
import PurchaseHistory from './PurchaseHistory';
import SalesHistory from './SalesHistory';
import Market from '../pages/Market';
import '../css/Dashboard.css';

// SVG defs for gradient definitions
const SvgDefs = () => (
  <svg id="gradientDefs">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6930c3" />
        <stop offset="100%" stopColor="#64dfdf" />
      </linearGradient>
    </defs>
  </svg>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [apiKeys, setApiKeys] = useState([]);
  const [temporaryTokens, setTemporaryTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, apiKeysRes] = await Promise.all([
          axios.get('/api/users/profile'),
          axios.get('/api/users/api-keys')
        ]);
        
        setApiKeys(apiKeysRes.data);
        setTemporaryTokens(userRes.data.temporaryTokens || []);
        setTimeout(() => setLoading(false), 800); // Add slight delay for animation
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);

  const addApiKey = async (newApiKey) => {
    try {
      const res = await axios.post('/api/users/api-keys', newApiKey);
      setApiKeys([...apiKeys, res.data.apiKey]);
      setShowAddModal(false);
      toast.success('API Key added successfully');
    } catch (err) {
      console.error('Error adding API key:', err);
      toast.error('Failed to add API Key');
    }
  };

  const deleteApiKey = async (id) => {
    try {
      await axios.delete(`/api/users/api-keys/${id}`);
      setApiKeys(apiKeys.filter(key => key._id !== id));
      toast.success('API Key deleted successfully');
    } catch (err) {
      console.error('Error deleting API key:', err);
      toast.error('Failed to delete API Key');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Here you would add logic to change the content based on the tab
    console.log(`Tab changed to: ${tab}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SvgDefs />
        <div className="main-content">
          <div className="loading-spinner">
            <CircularProgressbar 
              value={70} 
              text="Loading..." 
              styles={buildStyles({
                textColor: 'var(--text-primary)',
                pathColor: 'url(#gradient)',
                trailColor: 'rgba(255,255,255,0.1)'
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  const totalTokens = temporaryTokens.reduce((acc, token) => acc + token.tokensRemaining, 0);
  const tokenUsagePercentage = (totalTokens / (totalTokens + 100)) * 100;
  const todayGain = Math.floor(Math.random() * 50) + 10; // Simulated data
  const weeklyGrowth = Math.floor(Math.random() * 30) - 10; // Simulated data

  return (
    <div className="dashboard-container">
      <SvgDefs />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        toastStyle={{ 
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--border-radius-md)'
        }} 
      />
      
      {/* Top Navigation Bar - Removed Marketplace */}
      <div className="top-nav">
        <div className="top-nav-brand">Token Marketplace</div>
        <div className="top-nav-menu">
          <div 
            className={`top-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => handleTabChange('dashboard')}
          >
            Dashboard
          </div>
          <div 
            className={`top-nav-item ${activeTab === 'chat' ? 'active' : ''}`} 
            onClick={() => handleTabChange('chat')}
          >
            Chat
          </div>
          <div 
            className="top-nav-item" 
            onClick={() => console.log('Logout clicked')}
          >
            Logout
          </div>
        </div>
      </div>

      {/* Fixed Sidebar - Added Marketplace */}
      <div className="sidebar">
        <div className="sidebar-logo">TokenFlow</div>
        <div className="sidebar-menu">
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome /> Dashboard
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'apikeys' ? 'active' : ''}`}
            onClick={() => handleTabChange('apikeys')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiKey /> API Keys
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => handleTabChange('marketplace')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShoppingBag /> Marketplace
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => handleTabChange('purchases')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShoppingCart /> Purchase History
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => handleTabChange('sales')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsGraphUp /> Sales History
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMessageSquare /> Chat
          </motion.div>
          <motion.div 
            className={`sidebar-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSettings /> Settings
          </motion.div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            <FiUser />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'ravi'}</div>
            <div className="user-role">Pro User</div>
          </div>
          <motion.div 
            className="logout-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => console.log('Logout clicked')}
          >
            <FiLogOut />
          </motion.div>
        </div>
      </div>

      {/* Main Content - Conditional rendering based on active tab */}
      <motion.div 
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-header">
              <div>
                <h2>Welcome back, {user?.name || 'ravi'}</h2>
                <p>Here's what's happening with your tokens today</p>
              </div>
              <motion.button 
                className="btn-primary" 
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiKey /> Add New API Key
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards-container">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <div className="stats-card">
                  <div className="stats-icon">
                    <FiKey />
                  </div>
                  <div className="stats-content">
                    <div className="stats-title">Total API Keys</div>
                    <div className="stats-value">
                      <CountUp end={apiKeys.length || 0} duration={2.5} />
                    </div>
                    <div className="stats-trend">
                      <BsArrowUpRight /> +2 this month
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="stats-card">
                  <div className="stats-icon">
                    <BsWallet2 />
                  </div>
                  <div className="stats-content">
                    <div className="stats-title">Active Tokens</div>
                    <div className="stats-value">
                      <CountUp end={temporaryTokens.length || 7} duration={2.5} />
                    </div>
                    <div className="stats-trend positive">
                      <BsArrowUpRight /> +{todayGain}% today
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="stats-card">
                  <div className="stats-icon">
                    <FiDollarSign />
                  </div>
                  <div className="stats-content">
                    <div className="stats-title">Token Value</div>
                    <div className="stats-value">
                      <CountUp end={0.35} prefix="$" decimals={2} duration={2.5} />
                    </div>
                    <div className={`stats-trend ${weeklyGrowth > 0 ? 'positive' : 'negative'}`}>
                      {weeklyGrowth > 0 ? <BsArrowUpRight /> : <BsArrowDownRight />} {Math.abs(weeklyGrowth)}% this week
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Token Usage Progress */}
            <motion.div 
              className="dashboard-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="card-header">
                <h4>Token Usage Analytics</h4>
              </div>
              <div className="card-body">
                <div className="token-usage-progress">
                  <CircularProgressbar
                    value={7}
                    text={`7%`}
                    styles={buildStyles({
                      pathColor: 'url(#gradient)',
                      textSize: '16px',
                      textColor: 'var(--text-primary)',
                      trailColor: 'rgba(255,255,255,0.1)'
                    })}
                  />
                  <div className="token-usage-info">
                    <div className="token-usage-label">Total Tokens Used</div>
                    <div className="token-usage-value">
                      <CountUp end={7} duration={2.5} />
                    </div>
                    <motion.div 
                      className="usage-details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="usage-metric">
                        <div className="metric-icon api">
                          <BsLightningCharge />
                        </div>
                        <div className="metric-info">
                          <div className="metric-title">API Calls</div>
                          <div className="metric-value">5</div>
                        </div>
                      </div>
                      <div className="usage-metric">
                        <div className="metric-icon storage">
                          <FiShield />
                        </div>
                        <div className="metric-info">
                          <div className="metric-title">Token Security</div>
                          <div className="metric-value">High</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API Keys Section */}
            <motion.div 
              className="dashboard-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div className="card-header">
                <h4>Your API Keys</h4>
              </div>
              <div className="card-body">
                <ApiKeyList apiKeys={apiKeys} onDelete={deleteApiKey} />
              </div>
            </motion.div>

            {/* Tokens Section */}
            {temporaryTokens.length > 0 && (
              <motion.div 
                className="dashboard-card"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <div className="card-header">
                  <h4>Your Purchased Tokens</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>API Key Name</th>
                          <th>Tokens Remaining</th>
                          <th>Purchased Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {temporaryTokens.map(token => (
                          <tr key={token._id}>
                            <td data-label="API Key Name">
                              <div className="table-item-with-icon">
                                <div className="item-icon">
                                  <FiKey />
                                </div>
                                {token.apiKeyName}
                              </div>
                            </td>
                            <td data-label="Tokens Remaining">{token.tokensRemaining}</td>
                            <td data-label="Purchased Date">{new Date(token.purchasedAt).toLocaleDateString()}</td>
                            <td data-label="Status">
                              <span className="status-badge active">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* History Sections - Fixed row structure */}
            <div className="row" style={{ width: '100%' }}>
              <div className="col-md-6">
                <motion.div 
                  className="dashboard-card"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  style={{ height: '100%' }}
                >
                  <div className="card-header">
                    <h4><FiShoppingCart /> Purchase History</h4>
                    <motion.button 
                      className="action-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiDownload /> Export
                    </motion.button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>API Key</th>
                            <th>Seller</th>
                            <th>Tokens</th>
                            <th>Total</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Sample purchase history data */}
                          <tr>
                            <td data-label="API Key">
                              <div className="table-item-with-icon">
                                <div className="item-icon">
                                  <FiKey />
                                </div>
                                <span className="item-name">API Key 1</span>
                              </div>
                            </td>
                            <td data-label="Seller">TokenVendor</td>
                            <td data-label="Tokens">1000</td>
                            <td data-label="Total">$12.50</td>
                            <td data-label="Date">
                              <div className="table-item-with-icon">
                                <FiCalendar />
                                <span className="timestamp">April 10, 2023</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td data-label="API Key">
                              <div className="table-item-with-icon">
                                <div className="item-icon">
                                  <FiKey />
                                </div>
                                <span className="item-name">API Key 2</span>
                              </div>
                            </td>
                            <td data-label="Seller">TokenMaster</td>
                            <td data-label="Tokens">500</td>
                            <td data-label="Total">$6.75</td>
                            <td data-label="Date">
                              <div className="table-item-with-icon">
                                <FiCalendar />
                                <span className="timestamp">March 25, 2023</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-6">
                <motion.div 
                  className="dashboard-card"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  style={{ height: '100%' }}
                >
                  <div className="card-header">
                    <h4><BsGraphUp /> Sales History</h4>
                    <motion.button 
                      className="action-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiDownload /> Export
                    </motion.button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>API Key</th>
                            <th>Buyer</th>
                            <th>Tokens</th>
                            <th>Total</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Sample sales history data */}
                          <tr>
                            <td data-label="API Key">
                              <div className="table-item-with-icon">
                                <div className="item-icon">
                                  <FiKey />
                                </div>
                                <span className="item-name">Runtime Token</span>
                              </div>
                            </td>
                            <td data-label="Buyer">John D.</td>
                            <td data-label="Tokens">200</td>
                            <td data-label="Total">$4.50</td>
                            <td data-label="Date">
                              <div className="table-item-with-icon">
                                <FiCalendar />
                                <span className="timestamp">April 12, 2023</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td data-label="API Key">
                              <div className="table-item-with-icon">
                                <div className="item-icon">
                                  <FiKey />
                                </div>
                                <span className="item-name">Analytics Token</span>
                              </div>
                            </td>
                            <td data-label="Buyer">Sarah M.</td>
                            <td data-label="Tokens">750</td>
                            <td data-label="Total">$9.25</td>
                            <td data-label="Date">
                              <div className="table-item-with-icon">
                                <FiCalendar />
                                <span className="timestamp">April 5, 2023</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'apikeys' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Your API Keys</h4>
              <motion.button 
                className="btn-primary" 
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiKey /> Add New API Key
              </motion.button>
            </div>
            <div className="card-body">
              <ApiKeyList apiKeys={apiKeys} onDelete={deleteApiKey} />
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <Market />
        )}

        {activeTab === 'purchases' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h4><FiShoppingCart /> Purchase History</h4>
              <motion.button 
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload /> Export
              </motion.button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>API Key</th>
                      <th>Seller</th>
                      <th>Tokens</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample purchase history data */}
                    <tr>
                      <td data-label="API Key">
                        <div className="table-item-with-icon">
                          <div className="item-icon">
                            <FiKey />
                          </div>
                          <span className="item-name">API Key 1</span>
                        </div>
                      </td>
                      <td data-label="Seller">TokenVendor</td>
                      <td data-label="Tokens">1000</td>
                      <td data-label="Total">$12.50</td>
                      <td data-label="Date">
                        <div className="table-item-with-icon">
                          <FiCalendar />
                          <span className="timestamp">April 10, 2023</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td data-label="API Key">
                        <div className="table-item-with-icon">
                          <div className="item-icon">
                            <FiKey />
                          </div>
                          <span className="item-name">API Key 2</span>
                        </div>
                      </td>
                      <td data-label="Seller">TokenMaster</td>
                      <td data-label="Tokens">500</td>
                      <td data-label="Total">$6.75</td>
                      <td data-label="Date">
                        <div className="table-item-with-icon">
                          <FiCalendar />
                          <span className="timestamp">March 25, 2023</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h4><BsGraphUp /> Sales History</h4>
              <motion.button 
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload /> Export
              </motion.button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>API Key</th>
                      <th>Buyer</th>
                      <th>Tokens</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample sales history data */}
                    <tr>
                      <td data-label="API Key">
                        <div className="table-item-with-icon">
                          <div className="item-icon">
                            <FiKey />
                          </div>
                          <span className="item-name">Runtime Token</span>
                        </div>
                      </td>
                      <td data-label="Buyer">John D.</td>
                      <td data-label="Tokens">200</td>
                      <td data-label="Total">$4.50</td>
                      <td data-label="Date">
                        <div className="table-item-with-icon">
                          <FiCalendar />
                          <span className="timestamp">April 12, 2023</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td data-label="API Key">
                        <div className="table-item-with-icon">
                          <div className="item-icon">
                            <FiKey />
                          </div>
                          <span className="item-name">Analytics Token</span>
                        </div>
                      </td>
                      <td data-label="Buyer">Sarah M.</td>
                      <td data-label="Tokens">750</td>
                      <td data-label="Total">$9.25</td>
                      <td data-label="Date">
                        <div className="table-item-with-icon">
                          <FiCalendar />
                          <span className="timestamp">April 5, 2023</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h4><FiMessageSquare /> Chat</h4>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-icon">
                  <FiMessageSquare />
                </div>
                <h4>Chat Interface</h4>
                <p>Connect with token sellers and other users in our community chat.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h4><FiSettings /> Settings</h4>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-icon">
                  <FiSettings />
                </div>
                <h4>User Settings</h4>
                <p>Manage your account preferences and notification settings.</p>
              </div>
            </div>
          </div>
        )}

        {/* Add API Key Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <AddApiKeyModal 
                  onAdd={addApiKey} 
                  onClose={() => setShowAddModal(false)} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard;