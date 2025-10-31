// Checkout page:
// Shipping Address
// Invoice
// Payment
// Receipt


import React, { useState } from 'react';
import './App.css';

function Checkout({ 
  currentUserId,
  onBackToCart,
  onCheckoutComplete 
}) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quoteResponse = await fetch('http://localhost:4000/api/checkout/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: currentUserId,
        shipping_address: shippingAddress.trim()
      })
    });

    const quoteData = await quoteResponse.json();
    
    const mockInvoice = {
      invoice_number: 'QUOTE-PREVIEW',
      order: {
        order_id: 'PENDING',
        order_status: 'Quote',
        shipping_address: shippingAddress.trim(),
        created_at: new Date().toISOString()
      },
      items: quoteData.items,
      subtotal: quoteData.totals.subtotal,
      tax: quoteData.totals.tax,
      shipping: quoteData.totals.shippingCost,
      total: quoteData.totals.total
    };

    setInvoice(mockInvoice);
    setShowInvoice(true);
  };

  const handleBackToCart = () => {
    if (onBackToCart) {
      onBackToCart();
    }
  };

  const handleBackToCatalogue = () => {
    if (onCheckoutComplete) {
      onCheckoutComplete();
    }
  };

  const handleCompleteOrder = async () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const orderResponse = await fetch('http://localhost:4000/api/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: currentUserId,
        shipping_address: shippingAddress.trim()
      })
    });

    const orderData = await orderResponse.json();
    const orderId = orderData.order_id;

    await fetch('http://localhost:4000/api/checkout/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        user_id: currentUserId
      })
    });

    const invoiceResponse = await fetch(`http://localhost:4000/api/checkout/invoice/${orderId}`);
    const invoiceData = await invoiceResponse.json();
    setInvoice(invoiceData);
    setShowPaymentForm(false);
    setShowReceipt(true);
  };


  return (
    <div className="checkout-page">
      {/* Back to Cart Button - Top Right */}
      <div className="shopping-cart-toggle">
        <button className="cart-button" onClick={handleBackToCart}>
          Back to Cart
        </button>
      </div>

      {/* Header */}

      {!showInvoice && (
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Shipping Information</h2>
            
            <div className="form-group">
              <label htmlFor="shipping-address">Shipping Address *</label>
              <textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn--success checkout-btn"
            >
              Next
            </button>
          </form>
        </div>
      )}

      {showInvoice && invoice && !showReceipt && (
        <div className="invoice-container">
          <h2>Invoice</h2>
          
          <div className="invoice-details">
            <div className="invoice-section">
              <h3>Order Details</h3>
              <p><strong>Order ID: </strong> {invoice.order.order_id}</p>
              <p><strong>Status: </strong> {invoice.order.order_status}</p>
              <p><strong>Shipping Address: </strong> {invoice.order.shipping_address}</p>
              <p><strong>Order Date: </strong> {formatDate(invoice.order.order_date)}</p>
            </div>

            <div className="invoice-section">
              <h3>Items Ordered</h3>
              <div className="invoice-items">
                {invoice.items.map((item, index) => (
                  <div key={index} className="invoice-item">
                    <div className="item-details">
                      <span className="item-name">{item.product_name || item.name}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="invoice-section">
              <h3>Order Summary</h3>
              <div className="invoice-totals">
                <div className="total-line">
                  <span>Subtotal: </span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Tax (10%): </span>
                  <span>${(invoice.tax || 0).toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping: </span>
                  <span>${(invoice.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="total-line total-final">
                  <span>Total: </span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-actions">
            {invoice.order.order_status === 'Quote' ? (
              <button 
                className="btn btn-primary"
                onClick={handleCompleteOrder}
              >
                Complete Order
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Continue Shopping
              </button>
            )}
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="checkout-form-container">
          <form onSubmit={handlePaymentSubmit} className="checkout-form">
            <h2>Payment Information</h2>
            
            <div className="form-group">
              <label htmlFor="card-number">Card Number *</label>
              <input
                id="card-number"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter your card number..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiry-date">Expiry Date *</label>
              <input
                id="expiry-date"
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn--success checkout-btn"
            >
              Pay Now
            </button>
          </form>
        </div>
      )}

      {showReceipt && invoice && (
        <div className="invoice-container">
          <h2>Order Complete!</h2>
          <p style={{ textAlign: 'center', color: '#4caf50', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Thank you for your purchase! Your order will be delivered shortly.
          </p>
          
          <div className="invoice-details">
            <div className="invoice-section">
              <h3>Order Details</h3>
              <p><strong>Order ID: </strong> {invoice.order.order_id}</p>
              <p><strong>Status: </strong> {invoice.order.order_status}</p>
              <p><strong>Shipping Address: </strong> {invoice.order.shipping_address}</p>
              <p><strong>Order Date: </strong> {formatDate(invoice.order.order_date)}</p>
            </div>

            <div className="invoice-section">
              <h3>Items Ordered</h3>
              <div className="invoice-items">
                {invoice.items.map((item, index) => (
                  <div key={index} className="invoice-item">
                    <div className="item-details">
                      <span className="item-name">{item.product_name || item.name}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="invoice-section">
              <h3>Order Summary</h3>
              <div className="invoice-totals">
                <div className="total-line total-final">
                  <span>Total: </span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-actions">
            <button 
              className="cart-button"
              onClick={handleBackToCatalogue}
            >
              Back to Catalogue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
