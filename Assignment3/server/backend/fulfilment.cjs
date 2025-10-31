// server/backend/fulfilment.cjs
class FulfilmentService {
  constructor(db) {
    this.db = db;
  }

  // list orders that need fulfilment
  async listPending() {
    return await this.db.all(
      `SELECT o.*,
              IFNULL(GROUP_CONCAT(oi.product_name || ' x' || oi.quantity, ', '),'') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.order_id
       WHERE o.order_status IN ('Paid','Packing')
       GROUP BY o.order_id
       ORDER BY datetime(o.order_date) ASC`
    );
  }

  // get single order
  async getOrder(orderId) {
    const order = await this.db.get(
      `SELECT * FROM orders WHERE order_id = ?`,
      orderId
    );
    if (!order) return null;
    const items = await this.db.all(
      `SELECT item_id, product_id, product_name, quantity, price
       FROM order_items WHERE order_id = ?`,
      orderId
    );
    order.items = items;
    return order;
  }

  // update order status to a valid state
  async updateOrderStatus(orderId, status) {
    await this.db.run(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      status, orderId
    );
    return this.getOrder(orderId);
  }

  //"Ship" an order: set order_status = 'Shipped'
  async shipOrder(orderId) {
    await this.db.run(
      `UPDATE orders SET order_status = 'Shipped' WHERE order_id = ?`,
      orderId
    );
    return this.getOrder(orderId);
  }

  //get a packaging slip for an order
  async getPackagingSlip(orderId) {
    const order = await this.getOrder(orderId);
    const user = await this.db.get(
      `SELECT name, email FROM users WHERE user_id = ?`,
      order.user_id
    );

    return {
      shipping_address: order.shipping_address || 'N/A',
      user_name: user?.name || 'N/A',
      user_email: user?.email || 'N/A',
      order_id: order.order_id,
      order_date: order.order_date,
      total_paid: order.order_total || 0
    };
  }
}

module.exports = FulfilmentService;
