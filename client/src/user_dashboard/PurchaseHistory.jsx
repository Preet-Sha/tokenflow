// client/src/components/dashboard/PurchaseHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchaseHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/api/users/transactions');
        setTransactions(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching purchase history:', err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <p>Loading transactions...</p>;
  }

  if (transactions.length === 0) {
    return <p>No purchase history found.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
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
          {transactions.map(transaction => (
            <tr key={transaction._id}>
              <td>{transaction.apiKeyName}</td>
              <td>{transaction.seller.name}</td>
              <td>{transaction.tokensPurchased}</td>
              <td>${transaction.totalAmount.toFixed(2)}</td>
              <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseHistory;