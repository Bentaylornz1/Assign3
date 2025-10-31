//Admin Home Page - Will complete when we have the stats backend completed

import { useEffect, useState } from 'react';
import './App.css';
import AdminUpdateCatalogue from './AdminUpdateCatalogue.jsx';
import AdminFulfilment from './AdminFulfilment.jsx';
import AdminStats from './AdminStats.jsx';

function Admin({onSetTitle }) {
  const [view, setView] = useState('home');

  useEffect(() => {
    if (onSetTitle) {
      if (view === 'updateCatalogue') {
        onSetTitle('Update Catalogue');
      } else if (view === 'fulfilment') {
        onSetTitle('Order Fulfilment');
      } else if (view === 'stats') {
        onSetTitle('Statistics');
      } else {
        onSetTitle('Admin Home');
      }
    }
  }, [view, onSetTitle]);

  if (view === 'updateCatalogue') {
    return (
      <div className="cart-page">
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setView('home')}>Back to Admin Home</button>
        </div>
        <AdminUpdateCatalogue />
      </div>
    );
  }

  if (view === 'fulfilment') {
    return (
      <div className="cart-page">
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setView('home')}>Back to Admin Home</button>
        </div>
        <AdminFulfilment />
      </div>
    );
  }

  if (view === 'stats') {
    return (
      <div className="cart-page">
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setView('home')}>Back to Admin Home</button>
        </div>
        <AdminStats />
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div style={{ marginTop: '16px' }}>
        <button className="checkout-button" onClick={() => setView('updateCatalogue')}>Update Catalogue</button>
        <div style={{ marginTop: '12px' }}>
          <button className="checkout-button" onClick={() => setView('fulfilment')}>Order Fulfilment</button>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="checkout-button" onClick={() => setView('stats')}>Statistics</button>
        </div>
      </div>
    </div>
  );
}

export default Admin;

