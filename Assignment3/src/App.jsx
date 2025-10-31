// App.jsx acts as the entry point and will facilitate navigation between the pages


import { useEffect, useState, useCallback } from 'react';
import './App.css';
import logo from "./assets/logo.png";
import Catalogue from './Catalogue';
import Admin from './Admin';
import ShoppingCart from './ShoppingCart';
import Checkout from './Checkout';

function App() {
  // User state: 1 = Admin, 2 = Customer
  // By default have customer start
  const [currentUserId, setCurrentUserId] = useState(2); 
  const [currentView, setCurrentView] = useState('customer');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [pageTitle, setPageTitle] = useState('Product Catalogue');

  // Fetch user's cart
  const fetchCart = useCallback(async () => {
    const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}`);
    const data = await response.json();
    setCartItems(data.items);
    setCartItemCount(data.item_count);
    setCartTotal(data.total);
  }, [currentUserId]);

  useEffect(() => {
    // Fetch cart on mount and when user changes
    if (currentView === 'customer') {
      fetchCart();
    }
  }, [currentUserId, currentView, fetchCart]);

  //Change admin/customer view
  const handleViewToggle = () => {
    if (currentView === 'customer') {
      setCurrentUserId(1); //1 = Admin
      setCurrentView('admin');
      setShowCart(false);
      setShowCheckout(false);
      setPageTitle('Admin Home');
    } else {
      setCurrentUserId(2); //2 = Customer
      setCurrentView('customer');
      setPageTitle('Product Catalogue');
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (product) => {
    const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product.product_id,
        quantity: 1
      })
    });
    const data = await response.json();
    setCartItems(data.items);
    setCartItemCount(data.item_count);
    setCartTotal(data.total);
  };

  // Handle quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}/items/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: newQuantity })
    });
    const data = await response.json();
    setCartItems(data.items);
    setCartItemCount(data.item_count);
    setCartTotal(data.total);
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}/items/${productId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    setCartItems(data.items);
    setCartItemCount(data.item_count);
    setCartTotal(data.total);
  };

  // Handle checkout button
  const handleCheckout = () => {
    setShowCheckout(true);
  };

  // Handle checkout completion
  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setShowCart(false);
    fetchCart();
  };

  // Handle back to cart from checkout
  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  // Keep page title in sync for customer views
  useEffect(() => {
    if (currentView === 'customer') {
      if (showCheckout) setPageTitle('Checkout');
      else if (showCart) setPageTitle('Shopping Cart');
      else setPageTitle('Product Catalogue');
    }
  }, [currentView, showCart, showCheckout]);

  return (
    <div className="app">
      {/* User Toggle*/}
      <div className="user-toggle">
        <button onClick={handleViewToggle} className="toggle-button">
          {currentView === 'customer' ? 'Go to Admin' : 'Go to Customer'}
        </button>
        <span className="current-user">
          {currentView === 'admin' ? 'Admin (User ID: 1)' : 'Customer (User ID: 2)'}
        </span>
      </div>

      {currentView === 'customer' && !showCheckout && (
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setShowCart(!showCart)}>
            {showCart ? 'Back to Catalogue' : `Cart (${cartItemCount})`}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>{pageTitle}</h1>
      </header>

      {/* Main Content */}
      <main className="catalogue">
        {currentView === 'admin' ? (
          <Admin currentUserId={currentUserId} onSetTitle={setPageTitle} />
        ) : showCheckout ? (
          <Checkout
            currentUserId={currentUserId}
            onBackToCart={handleBackToCart}
            onCheckoutComplete={handleCheckoutComplete}
          />
        ) : showCart ? (
          <ShoppingCart
            cartItems={cartItems}
            cartTotal={cartTotal}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        ) : (
          <Catalogue
            currentUserId={currentUserId}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
