import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 6;

const Market = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ apiKeyId: '', tokensForSale: '', pricePerToken: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, apiKeysRes] = await Promise.all([
          axios.get('/api/marketplace/listings'),
          axios.get('/api/users/api-keys')
        ]);
        setListings(listingsRes.data);
        setFiltered(listingsRes.data);
        setApiKeys(apiKeysRes.data);
      } catch (err) {
        console.error('Error loading market:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyTokens = async (listingId, amount) => {
    try {
      await axios.post(`/api/marketplace/buy/${listingId}`, { tokensToBuy: amount });
      const refreshed = await axios.get('/api/marketplace/listings');
      setListings(refreshed.data);
      setFiltered(refreshed.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error buying tokens');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredList = listings.filter(item =>
      item.apiKeyName.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
    setFiltered(filteredList);
    setCurrentPage(1);
  };

  const paginatedListings = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleCreateListing = async () => {
    try {
      const res = await axios.post('/api/marketplace/listings', formData);
      setListings([res.data, ...listings]);
      setFiltered([res.data, ...filtered]);
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating listing');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Token Market</h1>
          <p className="text-gray-600">Buy and sell API tokens</p>
        </div>
        {user && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowCreateModal(true)}>+ List Your Token</button>
        )}
      </div>

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:w-1/2 px-3 py-2 border rounded"
        />
        <select
          onChange={(e) => {
            const sort = e.target.value;
            const sorted = [...filtered].sort((a, b) => {
              if (sort === 'price-asc') return a.pricePerToken - b.pricePerToken;
              if (sort === 'price-desc') return b.pricePerToken - a.pricePerToken;
              return 0;
            });
            setFiltered(sorted);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Sort</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedListings.map((listing) => (
            <motion.div
              key={listing._id}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl shadow-lg border p-4"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                  {listing.apiKeyName?.[0] || 'T'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{listing.apiKeyName}</h2>
                  <p className="text-sm text-gray-500">{listing.seller?.email}</p>
                </div>
              </div>
              <p className="mb-2 text-gray-700 text-sm">{listing.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${listing.pricePerToken}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="font-medium">{listing.tokensForSale}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={listing.tokensForSale}
                  defaultValue={1}
                  className="w-16 px-2 py-1 border rounded"
                  onChange={(e) => listing.buyAmount = parseInt(e.target.value)}
                />
                <button
                  onClick={() => handleBuyTokens(listing._id, listing.buyAmount || 1)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Buy
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create Listing</h2>
            <div className="space-y-3">
              <select
                value={formData.apiKeyId}
                onChange={(e) => setFormData({ ...formData, apiKeyId: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select API Key</option>
                {apiKeys.map(key => (
                  <option key={key._id} value={key._id}>
                    {key.name} ({key.available} tokens)
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Tokens for sale"
                value={formData.tokensForSale}
                onChange={(e) => setFormData({ ...formData, tokensForSale: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Price per token"
                value={formData.pricePerToken}
                onChange={(e) => setFormData({ ...formData, pricePerToken: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 border rounded" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCreateListing}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
