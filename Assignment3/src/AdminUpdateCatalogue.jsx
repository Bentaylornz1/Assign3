//Update catalogue Admin Page

import { useEffect, useState, useCallback } from 'react';
import './App.css';

function AdminUpdateCatalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, stock: 0, is_active: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', price: 0, stock: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/catalogue');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns = (() => {
    const keys = new Set();
    products.forEach((p) => Object.keys(p || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  })();

  return (
    <div className="cart-page admin-update-catalogue">
      <div className="section-base">
        <button className="checkout-button" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close' : 'Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="card-base">
          <h3>New Product</h3>
          <div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={addForm.price}
                onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={addForm.stock}
                onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="admin-add-form-actions">
            <button className="checkout-button" onClick={async () => {
              const payload = {
                name: addForm.name,
                description: addForm.description,
                price: Number(addForm.price) || 0,
                stock: Number(addForm.stock) || 0
              };
              await fetch('http://localhost:4000/api/catalogue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              await fetchProducts();
              setShowAddForm(false);
              setAddForm({ name: '', description: '', price: 0, stock: 0 });
            }}>
              Create
            </button>
            <button className="btn btn--muted" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="loading">Loading products...</p>}
      {!loading && (
        products.length === 0 ? (
          <p className="no-products">No products found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((row) => {
                  const isEditing = editingId === row.product_id;
                  return (
                    <tr key={row.product_id}>
                      {columns.map((col) => {
                        const value = row[col];
                        if (!isEditing) {
                          // Could've changed this in the DB to boolean but instead will just change frontend to TRUE/FALSE
                          if (col === 'is_active') {
                            const activeText = (value === 1 || value === true) ? 'TRUE' : 'FALSE';
                            return (
                              <td key={col}>{activeText}</td>
                            );
                          }
                          return (
                            <td key={col}>{String(value ?? '')}</td>
                          );
                        }
                        
                        if (col === 'name') {
                          return (
                            <td key={col}>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </td>
                          );
                        }
                        if (col === 'description') {
                          return (
                            <td key={col}>
                              <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                            </td>
                          );
                        }
                        if (col === 'price') {
                          return (
                            <td key={col}>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                className="input--narrow"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              />
                            </td>
                          );
                        }
                        if (col === 'stock') {
                          return (
                            <td key={col}>
                              <input
                                type="number"
                                min="0"
                                value={formData.stock}
                                className="input--narrow"
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                              />
                            </td>
                          );
                        }
                        if (col === 'is_active') {
                          return (
                            <td key={col}>
                              <input
                                type="checkbox"
                                checked={!!formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={col}>{String(value ?? '')}</td>
                        );
                      })}
                      <td>
                        {!isEditing ? (
                          <div className="row-actions">
                            <button className="btn btn--primary btn--sm" onClick={() => {
                                setEditingId(row.product_id);
                                setFormData({
                                  name: row.name || '',
                                  description: row.description || '',
                                  price: row.price ?? 0,
                                  stock: row.stock ?? 0,
                                  is_active: row.is_active === 1 || row.is_active === true
                                });
                              }}>
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            <button className="btn btn--success btn--sm" onClick={async () => {
                                await fetch(`http://localhost:4000/api/catalogue/${row.product_id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    name: formData.name,
                                    description: formData.description,
                                    price: Number(formData.price) || 0,
                                    stock: Number(formData.stock) || 0
                                  })
                                });
                                await fetch(`http://localhost:4000/api/catalogue/${row.product_id}/active`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ is_active: !!formData.is_active })
                                });
                                await fetchProducts();
                                setEditingId(null);
                              }}>
                              Save
                            </button>
                            <button className="btn btn--muted btn--sm" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                            
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default AdminUpdateCatalogue;


