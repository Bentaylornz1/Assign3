//Acts as the customer home page

import { useEffect, useState } from 'react';
import './App.css';

function Catalogue({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/catalogue');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      //Only show available products (is_active = 1)
      const activeProducts = data.filter(product => product.is_active !== 0);
      setProducts(activeProducts);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      {loading && <div className="loading">Loading products...</div>}
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchProducts}>Try Again</button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="no-products">
          <p>No products available.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
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
          <div className="products-count">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}

export default Catalogue;

