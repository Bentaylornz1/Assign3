// server/backend/stats.cjs
class StatsService {
  constructor(db) {
    this.db = db;
  }

  // sales summary (orders count + revenue)
  async salesSummary({ from, to } = {}) {
    let where = "";
    const params = [];
    if (from) { where += (where ? " AND " : " WHERE ") + " datetime(order_date) >= datetime(?)"; params.push(from); }
    if (to)   { where += (where ? " AND " : " WHERE ") + " datetime(order_date) <  datetime(?)"; params.push(to); }

    const totals = await this.db.get(
      `SELECT COUNT(*) AS orders_count, IFNULL(SUM(order_total),0) AS revenue
       FROM orders
       ${where}`,
      ...params
    );
    return { orders_count: totals.orders_count, revenue: Number(totals.revenue) };
  }

  // top-selling products (by quantity sold)
  async topProducts({ limit = 5, from, to } = {}) {
    let where = "";
    const params = [];
    if (from) { where += (where ? " AND " : " WHERE ") + " datetime(o.order_date) >= datetime(?)"; params.push(from); }
    if (to)   { where += (where ? " AND " : " WHERE ") + " datetime(o.order_date) <  datetime(?)"; params.push(to); }

    const rows = await this.db.all(
      `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS quantity_sold, SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.order_id = oi.order_id
       ${where}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY quantity_sold DESC
       LIMIT ?`,
      ...params, limit
    );
    // normalise revenue to number
    return rows.map(r => ({ ...r, revenue: Number(r.revenue) }));
  }

  // orders grouped by status
  async ordersByStatus() {
    const rows = await this.db.all(
      `SELECT order_status, COUNT(*) AS count
       FROM orders
       GROUP BY order_status`
    );
    return rows;
  }
}

module.exports = StatsService;
