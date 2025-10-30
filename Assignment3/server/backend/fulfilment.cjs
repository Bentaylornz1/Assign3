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
      `SELECT item_id, product_id, product_name, quantity, unit_price
       FROM order_items WHERE order_id = ?`,
      orderId
    );
    order.items = items;
    return order;
  }

  // update order status to a valid state
  async updateOrderStatus(orderId, status) {
    const allowed = ['Pending','Paid','Packing','Shipped','Delivered'];
    if (!allowed.includes(status)) {
      throw new Error('Invalid status');
    }
    await this.db.run(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      status, orderId
    );
    return this.getOrder(orderId);
  }

  // "Ship" an order: check stock, decrement stock, and set order_status = 'Shipped'
  // This runs inside a simple transaction to avoid partial updates.
  async shipOrder(orderId) {
    // Begin transaction
    await this.db.run(`BEGIN TRANSACTION`);
    try {
      const order = await this.getOrder(orderId);
      if (!order) throw new Error('Order not found');

      // Only ship orders that are at least Paid or Packing
      if (!['Paid','Packing'].includes(order.order_status)) {
        throw new Error(`Order status must be 'Paid' or 'Packing' to ship`);
      }

      // Get items and verify stock
      for (const it of order.items) {
        // if product_id is null (unlikely) skip; but check
        if (!it.product_id) continue;
        const prod = await this.db.get(
          `SELECT product_id, stock FROM products WHERE product_id = ?`,
          it.product_id
        );
        if (!prod) {
          throw new Error(`Product ${it.product_id} not found`);
        }
        if (prod.stock < it.quantity) {
          throw new Error(`Insufficient stock for product ${it.product_name} (id ${it.product_id}). Have ${prod.stock}, need ${it.quantity}`);
        }
      }

      // Decrement stock
      for (const it of order.items) {
        if (!it.product_id) continue;
        const prod = await this.db.get(
          `SELECT stock FROM products WHERE product_id = ?`,
          it.product_id
        );
        const newStock = prod.stock - it.quantity;
        await this.db.run(
          `UPDATE products SET stock = ? WHERE product_id = ?`,
          newStock, it.product_id
        );
      }

      // Update order status to Shipped
      await this.db.run(
        `UPDATE orders SET order_status = 'Shipped' WHERE order_id = ?`,
        orderId
      );

      await this.db.run(`COMMIT`);
      return this.getOrder(orderId);
    } catch (err) {
      await this.db.run(`ROLLBACK`);
      throw err;
    }
  }
}

module.exports = FulfilmentService;
