//Admin Stats Page - 
//View revenue
//orders
// products sold by date range

import { useState, useEffect } from 'react';
import './App.css';

function AdminStats() {
  //Just assigning vastly seperate dates to easily display all data
  const [startDate, setStartDate] = useState('0001-01-01');
  const [endDate, setEndDate] = useState('3000-01-01');
  const [stats, setStats] = useState(null);

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSearch = async () => {
    const fromDate = startDate + ' 00:00:00';
    const toDate = new Date(endDate);
    toDate.setDate(toDate.getDate() + 1);
    const year = toDate.getFullYear();
    const month = String(toDate.getMonth() + 1).padStart(2, '0');
    const day = String(toDate.getDate()).padStart(2, '0');
    const toDateFormatted = `${year}-${month}-${day} 00:00:00`;

    //Fetch all stats in parallel
    const [salesRes, ordersRes, productsRes] = await Promise.all([
      fetch(`http://localhost:4000/api/stats/sales?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDateFormatted)}`),
      fetch(`http://localhost:4000/api/stats/orders?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDateFormatted)}`),
      fetch(`http://localhost:4000/api/stats/products-sold?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDateFormatted)}`)
    ]);

    const [salesData, ordersData, productsData] = await Promise.all([
      salesRes.json(),
      ordersRes.json(),
      productsRes.json()
    ]);

    setStats({
      revenue: salesData.revenue,
      ordersCount: salesData.orders_count,
      orders: ordersData,
      products: productsData
    });
  };

  //Load all stats
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cart-page admin-stats">

      <div className="stats-date-selector">
        <div className="form-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="end-date">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>

        <button className="checkout-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {stats && (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">${stats.revenue}</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.ordersCount}</p>
            </div>
          </div>

          <div className="stats-section">
            <h3>Orders</h3>
            <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User ID</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>{order.order_id}</td>
                        <td>{order.user_id}</td>
                        <td>{formatDateOnly(order.order_date)}</td>
                        <td>
                          <span className={`status-badge status-${order.order_status?.toLowerCase()}`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td>${order.order_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>

          <div className="stats-section">
            <h3>Products Sold</h3>
            <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Product Name</th>
                      <th>Quantity Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.products.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.product_id}</td>
                        <td>{product.product_name}</td>
                        <td>{product.quantity_sold}</td>
                        <td>${product.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminStats;

