// server/backend/order.cjs
/**
 * ORDER BACKEND CLASS (simple)
 * Responsibilities (per CRC):
 *  - Knows order id, customer, shipping address, products & prices
 *  - Can be created from Checkout (already handled by Checkout)
 *  - Knows current status
 *  - Knows invoice/receipt/ordertotal
 *  - Can provide data for statistics (simple summaries)
 */

class OrderService {
  constructor(db) {
    this.db = db;
  }

  // Basic fetches
  async getOrder(orderId) {
    return await this.db.get(`SELECT * FROM orders WHERE order_id = ?`, orderId);
  }

  async getItems(orderId) {
    return await this.db.all(
      `SELECT item_id, order_id, product_id, product_name, quantity, price
       FROM order_items
       WHERE order_id = ?`,
      orderId
    );
  }

  async getOrderWithItems(orderId) {
    const order = await this.getOrder(orderId);
    if (!order) return null;
    const items = await this.getItems(orderId);
    return { order, items };
  }

  // Listings
  async listAll() {
    return await this.db.all(
      `SELECT * FROM orders ORDER BY datetime(order_date) DESC`
    );
  }

  async listByUser(userId) {
    return await this.db.all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY datetime(order_date) DESC`,
      userId
    );
  }

  // Status updates (kept simple)
  async updateStatus(orderId, status) {
    await this.db.run(`UPDATE orders SET order_status = ? WHERE order_id = ?`, status, orderId);
    return await this.getOrder(orderId);
  }

  // Documents (keep the same shape as Checkout’s helpers)
  async getInvoice(orderId) {
    const order = await this.getOrder(orderId);
    if (!order) return null;
    const items = await this.getItems(orderId);
    const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    return {
      invoice_number: `INV-${orderId}`,
      order,
      items,
      subtotal,
      total: Number(order.order_total),
    };
  }

  async getReceipt(orderId) {
    const order = await this.getOrder(orderId);
    if (!order) return null;
    const items = await this.getItems(orderId);
    return {
      receipt_number: `RCT-${orderId}`,
      order,
      items,
      paid_at: new Date().toISOString(),
    };
  }

  // Very simple stats summary (optional helper)
  async getStatsSummary({ from, to } = {}) {
    let where = "";
    const params = [];
    if (from) { where += (where ? " AND" : " WHERE") + " datetime(order_date) >= datetime(?)"; params.push(from); }
    if (to)   { where += (where ? " AND" : " WHERE") + " datetime(order_date) <  datetime(?)"; params.push(to); }

    const totals = await this.db.get(
      `SELECT COUNT(*) AS orders_count, IFNULL(SUM(order_total),0) AS revenue
       FROM orders
       ${where}`,
      ...params
    );
    return { orders_count: totals.orders_count, revenue: Number(totals.revenue) };
  }
}

module.exports = OrderService;
