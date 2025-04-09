// client/src/components/marketplace/Marketplace.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// import ListingCard from './ListingCard';
// import CreateListingModal from './CreateListingModal';

const Market = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, apiKeysRes] = await Promise.all([
          axios.get('/api/marketplace/listings'),
          axios.get('/api/users/api-keys')
        ]);
        
        setListings(listingsRes.data);
        setApiKeys(apiKeysRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching marketplace data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createListing = async (listingData) => {
    try {
      const res = await axios.post('/api/marketplace/listings', listingData);
      setListings([res.data, ...listings]);
      
      // Update available tokens in API keys
      const updatedApiKeys = apiKeys.map(key => 
        key._id === listingData.apiKeyId 
          ? { ...key, available: key.available - listingData.tokensForSale }
          : key
      );
      setApiKeys(updatedApiKeys);
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating listing:', err);
    }
  };

  const buyTokens = async (listingId, tokensToBuy) => {
    try {
      await axios.post(`/api/marketplace/buy/${listingId}`, { tokensToBuy });
      
      // Update listings
      setListings(listings.map(listing => 
        listing._id === listingId
          ? { ...listing, tokensForSale: listing.tokensForSale - tokensToBuy }
          : listing
      ).filter(listing => listing.tokensForSale > 0));
      
      // Refresh data
      const listingsRes = await axios.get('/api/marketplace/listings');
      setListings(listingsRes.data);
      
    } catch (err) {
      console.error('Error buying tokens:', err);
      alert(err.response?.data?.message || 'Failed to buy tokens');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Token Marketplace</h2>
          <p className="lead">Browse and buy API tokens</p>
        </div>
        <div className="col-md-4 text-right">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateModal(true)}
          >
            Sell Tokens
          </button>
        </div>
      </div>
    </div>
  )
}


export default Market;