//Admin Fulfilment Page - Display pending orders that need fulfilment

import { useEffect, useState, useCallback } from 'react';
import './App.css';

function AdminFulfilment() {
  const [orders, setOrders] = useState([]);
  const [packagingSlip, setPackagingSlip] = useState(null);

  const fetchPendingOrders = useCallback(async () => {
    const res = await fetch('http://localhost:4000/api/fulfilment');
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    await fetch(`http://localhost:4000/api/fulfilment/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    await fetchPendingOrders();
  };

  const handleShipOrder = async (orderId) => {
    await fetch(`http://localhost:4000/api/fulfilment/${orderId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    await fetchPendingOrders();
  };

  const handleViewPackagingSlip = async (orderId) => {
    const res = await fetch(`http://localhost:4000/api/fulfilment/${orderId}/packaging-slip`);
    const data = await res.json();
    setPackagingSlip(data);
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="cart-page admin-fulfilment">

      {packagingSlip && (
        <div className="card-base packaging-slip-container">
          <h3>Packaging Slip</h3>
          <div className="packaging-slip-content">
            <p><strong>Shipping Address:</strong></p>
            <p className="packaging-slip-address">{packagingSlip.shipping_address}</p>
            
            <p className="packaging-slip-field"><strong>User Name:</strong> {packagingSlip.user_name}</p>
            
            <p><strong>User Email:</strong> {packagingSlip.user_email}</p>
            
            <p><strong>Order ID:</strong> {packagingSlip.order_id}</p>
            
            <p><strong>Order Date:</strong> {formatDateOnly(packagingSlip.order_date)}</p>
            
            <p><strong>Total Paid:</strong> ${packagingSlip.total_paid}</p>
            
            <div className="packaging-slip-print-container">
              <button className="checkout-button" onClick={() => {}}>
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Shipping Address</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Packaging Slip</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.user_id}</td>
                    <td>{formatDateOnly(order.order_date)}</td>
                    <td>
                      <span className={`status-badge status-${order.order_status?.toLowerCase()}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td>{order.shipping_address || 'N/A'}</td>
                    <td>${order.order_total}</td>
                    <td>{order.items || 'No items'}</td>
                    <td>
                      <button
                        className="btn btn--muted btn--sm"
                        onClick={() => handleViewPackagingSlip(order.order_id)}
                      >
                        Delivery Slip
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        {order.order_status === 'Paid' && (
                          <>
                            <button
                              className="btn btn--success btn--sm"
                              onClick={() => handleStatusUpdate(order.order_id, 'Packing')}
                            >
                              Mark Packing
                            </button>
                            <button
                              className="btn btn--primary btn--sm"
                              onClick={() => handleShipOrder(order.order_id)}
                            >
                              Order Shipped
                            </button>
                          </>
                        )}
                        {order.order_status === 'Packing' && (
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => handleShipOrder(order.order_id)}
                          >
                            Order Shipped
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>
    </div>
  );
}

export default AdminFulfilment;

