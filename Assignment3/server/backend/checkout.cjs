// server/backend/checkout.cjs
/**
 * CHECKOUT BACKEND CLASS
 * Implements the Assignment 2 CRC responsibilities
 * under simplified local conditions:
 *  - No payment or stock errors
 *  - Instant fulfilment after payment
 */

class Checkout {
  constructor(db) {
    this.db = db;
  }

  // 1. Collect and validate shipping address
  async collectShippingAddress(userId, address) {
    if (!address) throw new Error("Shipping address is required");
    return { user_id: userId, shipping_address: address.trim() };
  }

  // 2. Compute order total (products + taxes + shipping)
  computeOrderTotal(lines, taxRate = 0.1, shippingCost = 10.0) {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = +(subtotal + tax + shippingCost).toFixed(2);
    return { subtotal, tax, shippingCost, total };
  }

  // 3. Create Order from Shopping Cart (simple insert, no rollback)
  async createOrderFromCart(userId, address, lines, total) {
    const result = await this.db.run(
      `INSERT INTO orders (user_id, shipping_address, order_total, order_status)
       VALUES (?, ?, ?, 'Pending')`,
      userId,
      address,
      total
    );
    const orderId = result.lastID;

    for (const l of lines) {
      await this.db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        orderId,
        l.product_id,
        l.name,
        l.quantity,
        l.price
      );
    }

    return orderId;
  }

  // 4. Generate invoice for Order
  async generateInvoice(orderId) {
    const order = await this.db.get(`SELECT * FROM orders WHERE order_id = ?`, orderId);
    const items = await this.db.all(`SELECT * FROM order_items WHERE order_id = ?`, orderId);
    const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    return {
      invoice_number: `INV-${orderId}`,
      order,
      items,
      subtotal,
      total: order.order_total,
    };
  }

  // 5. Initiate payment (always succeeds)
  async initiatePayment(orderId) {
    await this.db.run(`UPDATE orders SET order_status = 'Paid' WHERE order_id = ?`, orderId);
    return { order_id: orderId, status: "Paid" };
  }

  // 6. Issue receipt (simple local generation)
  async issueReceipt(orderId) {
    const order = await this.db.get(`SELECT * FROM orders WHERE order_id = ?`, orderId);
    const items = await this.db.all(`SELECT * FROM order_items WHERE order_id = ?`, orderId);
    return {
      receipt_number: `RCT-${orderId}`,
      order,
      items,
      paid_at: new Date().toISOString(),
    };
  }

  // 7. Update order status
  async updateOrderStatus(orderId, status) {
    await this.db.run(`UPDATE orders SET order_status = ? WHERE order_id = ?`, status, orderId);
    return await this.db.get(`SELECT * FROM orders WHERE order_id = ?`, orderId);
  }

  // 8. Clear Shopping Cart after successful payment
  async clearShoppingCart(userId) {
    const cart = await this.db.get(`SELECT cart_id FROM shopping_carts WHERE user_id = ?`, userId);
    if (cart) {
      await this.db.run(`DELETE FROM cart_items WHERE cart_id = ?`, cart.cart_id);
    }
    return true;
  }

  // 9. Trigger Fulfilment (instant delivery for now)

  async triggerFulfilment(orderId) {
    await this.db.run(`UPDATE orders SET order_status = 'Delivered' WHERE order_id = ?`, orderId);
    return { order_id: orderId, status: "Delivered" };
  }

}

module.exports = Checkout;
