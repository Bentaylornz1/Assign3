// App.jsx acts as the entry point and will facilitate navigation between the pages
// Has some fallback logic - but should be able to remove them and it will just use the backend - I will test later


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

  // Fetch user's cart
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        // Store cart data from backend - all values computed by backend
        setCartItems(data.items);
        setCartItemCount(data.item_count);
        setCartTotal(data.total);
      } else {
        console.error('Failed to fetch cart, status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
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
    } else {
      setCurrentUserId(2); //2 = Customer
      setCurrentView('customer');
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (product) => {
    try {
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

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      console.log('Add to cart response:', data); // Debug
      
      // Update cart - use backend values, fallback if missing
      setCartItems(data.items || []);
      
      // Use backend item_count, fallback to calculation only if missing
      if (data.item_count !== undefined && data.item_count !== null) {
        setCartItemCount(data.item_count);
      } else {
        // Fallback calculation only if backend doesn't provide it
        const calculatedCount = data.items ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartItemCount(calculatedCount);
        console.warn('Backend did not return item_count, using fallback calculation:', calculatedCount);
      }
      
      // Use backend total, fallback to calculation only if missing
      if (data.total !== undefined && data.total !== null) {
        setCartTotal(data.total);
      } else {
        // Fallback calculation only if backend doesn't provide it
        const calculatedTotal = data.items ? data.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) : 0;
        setCartTotal(calculatedTotal);
        console.warn('Backend did not return total, using fallback calculation:', calculatedTotal);
      }
      
      console.log('Item added to cart:', product.name);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  // Handle quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0 or less
      await handleRemoveItem(productId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const data = await response.json();
      // Use backend values with fallback
      setCartItems(data.items || []);
      
      if (data.item_count !== undefined && data.item_count !== null) {
        setCartItemCount(data.item_count);
      } else {
        const calculatedCount = data.items ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartItemCount(calculatedCount);
      }
      
      if (data.total !== undefined && data.total !== null) {
        setCartTotal(data.total);
      } else {
        const calculatedTotal = data.items ? data.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) : 0;
        setCartTotal(calculatedTotal);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cart/${currentUserId}/items/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      // Use backend values with fallback
      setCartItems(data.items || []);
      
      if (data.item_count !== undefined && data.item_count !== null) {
        setCartItemCount(data.item_count);
      } else {
        const calculatedCount = data.items ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartItemCount(calculatedCount);
      }
      
      if (data.total !== undefined && data.total !== null) {
        setCartTotal(data.total);
      } else {
        const calculatedTotal = data.items ? data.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) : 0;
        setCartTotal(calculatedTotal);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  // Handle checkout button
  const handleCheckout = () => {
    setShowCheckout(true);
  };

  // Handle checkout completion
  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setShowCart(false);
    // Refresh cart data after checkout
    fetchCart();
  };

  // Handle back to cart from checkout
  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  // Determine current page
  const getCurrentPage = () => {
    if (currentView === 'admin') return 'Admin Home';
    if (showCheckout) return 'Checkout';
    if (showCart) return 'Shopping Cart';
    return 'Product Catalogue';
  };

  return (
    <div className="app">
      {/* User Toggle Button - Top Left */}
      <div className="user-toggle">
        <button onClick={handleViewToggle} className="toggle-button">
          {currentView === 'customer' ? 'Go to Admin' : 'Go to Customer'}
        </button>
        <span className="current-user">
          {currentView === 'admin' ? 'Admin (User ID: 1)' : 'Customer (User ID: 2)'}
        </span>
      </div>

      {/* Shopping Cart Button - Top Right */}
      {currentView === 'customer' && !showCheckout && (
        <div className="shopping-cart-toggle">
          <button className="cart-button" onClick={() => setShowCart(!showCart)}>
            {showCart ? '← Back to Catalogue' : `Cart (${cartItemCount})`}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>{getCurrentPage()}</h1>
      </header>

      {/* Main Content */}
      <main className="catalogue">
        {currentView === 'admin' ? (
          <Admin currentUserId={currentUserId} />
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
            currentUserId={currentUserId}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            onContinueShopping={() => setShowCart(false)}
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
