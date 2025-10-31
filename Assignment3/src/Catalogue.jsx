//Acts as the customer home page

import { useEffect, useState } from 'react';
import './App.css';

function Catalogue({ onAddToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('http://localhost:4000/api/catalogue');
    const data = await response.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  return (
    <div className="cart-page">
      <div className="products-grid">
            {products.map((product) => (
              <div key={product.product_id} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                </div>
                <div className="product-body">
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <div className="product-details">
                    <div className="product-price">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="product-stock">
                      {product.stock > 0 ? (
                        <span className="in-stock">
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="out-of-stock">Out of stock</span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-button"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default Catalogue;

