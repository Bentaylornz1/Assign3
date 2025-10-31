import './App.css';

function ShoppingCart({ 
  cartItems, 
  cartTotal,
  onQuantityChange, 
  onRemoveItem, 
  onCheckout
}) {

  return (
    <div className="cart-page">
      <div className="cart-items-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cart_item_id} className="cart-item">
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    {item.description && (
                      <p className="cart-item-description">{item.description}</p>
                    )}
                    <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-section">
                      <label className="quantity-label">Quantity:</label>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-button"
                          onClick={() => onQuantityChange(item.product_id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            onQuantityChange(item.product_id, newQty);
                          }}
                          className="quantity-input"
                        />
                        <button 
                          className="quantity-button"
                          onClick={() => onQuantityChange(item.product_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </div>
                    <button 
                      className="remove-item-button"
                      onClick={() => onRemoveItem(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <span className="total-label">Total:</span>
          <span className="total-amount">${(cartTotal || 0).toFixed(2)}</span>
        </div>
        <button className="checkout-button" onClick={onCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default ShoppingCart;

