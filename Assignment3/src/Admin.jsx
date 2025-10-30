//Admin Home Page - Will complete when we have the stats backend completed

import { useEffect, useState } from 'react';
import './App.css';
import AdminUpdateCatalogue from './AdminUpdateCatalogue.jsx';

function Admin({ currentUserId, onSetTitle }) {
  const [view, setView] = useState('home');

  useEffect(() => {
    if (onSetTitle) {
      onSetTitle(view === 'updateCatalogue' ? 'Update Catalogue' : 'Admin Home');
    }
  }, [view, onSetTitle]);

  if (view === 'updateCatalogue') {
    return (
      <div className="cart-page">
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setView('home')}>← Back to Admin Home</button>
        </div>
        <AdminUpdateCatalogue />
      </div>
    );
  }

  return (
    <div className="admin-home">
      <p>User ID: {currentUserId}</p>
      <div style={{ marginTop: '16px' }}>
        <button className="checkout-button" onClick={() => setView('updateCatalogue')}>Update Catalogue</button>
        <div style={{ marginTop: '12px' }}>
          <button className="checkout-button">Statistics</button>
        </div>
      </div>
    </div>
  );
}

export default Admin;

