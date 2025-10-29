// server/backend/checkout.cjs
/**
 * CHECKOUT BACKEND CLASS
 * Implements the Assignment 2 CRC responsibilities
 * under simplified local conditions:
 *  - No payment or stock errors
 *  - Instant fulfilment after payment
 */

class Checkout {
  constructor(db, { taxRate = 0.1, shippingCost = 10.0 } = {}) {
    this.db = db;
    this.taxRate = taxRate;
    this.shippingCost = shippingCost;
  }

  //Get the cart items for a user
  async getCartLines(userId) {
    return this.db.all(
      `SELECT p.product_id, p.name, p.price, ci.quantity
       FROM cart_items ci
       JOIN products p ON p.product_id = ci.product_id
       JOIN shopping_carts sc ON ci.cart_id = sc.cart_id
       WHERE sc.user_id = ?`,
      userId
    );
  }

  // 1. Collect and validate shipping address
  async collectShippingAddress(userId, address) {
    if (!address) throw new Error("Shipping address is required");
    return { user_id: userId, shipping_address: address.trim() };
  }

  // 2. Compute order total (products + taxes + shipping)
  computeOrderTotal(lines) {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const tax = +(subtotal * this.taxRate).toFixed(2);
    const total = +(subtotal + tax + this.shippingCost).toFixed(2);
    return { subtotal, tax, shippingCost: this.shippingCost, total };
  }

  // 3. Check stock availability before creating order
  async checkStockAvailability(lines) {
    for (const line of lines) {
      const product = await this.db.get(
        `SELECT stock, name FROM products WHERE product_id = ?`,
        line.product_id
      );
      
      if (!product) {
        throw new Error(`Product ${line.product_id} not found`);
      }
      
      if (product.stock < line.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${line.quantity}`);
      }
    }
    return true;
  }

  // 4. Create Order from Shopping Cart (with stock check)
  async createOrderFromCart(userId, address) {
    const lines = await this.getCartLines(userId);
    const totals = this.computeOrderTotal(lines);

    // Check stock availability before creating order
    await this.checkStockAvailability(lines);

    await this.db.exec("BEGIN");
    try {
      const result = await this.db.run(
        `INSERT INTO orders (user_id, shipping_address, order_total, order_status)
         VALUES (?, ?, ?, 'Pending')`,
        userId, address, totals.total
      );
      const orderId = result.lastID;

      for (const l of lines) {
        await this.db.run(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          orderId, l.product_id, l.name, l.quantity, l.price
        );
      }

      await this.db.exec("COMMIT");
      return { orderId, lines, totals };
    } catch (e) {
      await this.db.exec("ROLLBACK");
      throw e;
    }
  }

  // 5. Generate invoice for Order
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

  // 6. Issue receipt
  async issueReceipt(orderId) {
    const order = await this.db.get(`SELECT * FROM orders WHERE order_id = ?`, orderId);
    const items = await this.db.all(`SELECT * FROM order_items WHERE order_id = ?`, orderId);
    return {
      //Im just going to make the receipt number the OrderID for simplicity
      receipt_number: `Receipt Number: ${orderId}`,
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

  // 9. Assert order belongs to user
  async assertOrderBelongsToUser(orderId, userId) {
    const order = await this.db.get(`SELECT * FROM orders WHERE order_id = ? AND user_id = ?`, orderId, userId);
    if (!order) throw new Error("Order not found or does not belong to user");
    return order;
  }

  // 10. Reduce stock levels for ordered items
  async reduceStockLevels(orderId) {
    const orderItems = await this.db.all(
      `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
      orderId
    );

    for (const item of orderItems) {
      await this.db.run(
        `UPDATE products SET stock = stock - ? WHERE product_id = ?`,
        item.quantity, item.product_id
      );
    }

    return { order_id: orderId, items_updated: orderItems.length };
  }

  // 11. Initiate payment (mark as paid and reduce stock)
  async initiatePayment(orderId) {
    await this.db.exec("BEGIN");
    try {
      // Update order status to paid
      await this.db.run(`UPDATE orders SET order_status = 'Paid' WHERE order_id = ?`, orderId);
      
      // Reduce stock levels for all items in the order
      await this.reduceStockLevels(orderId);
      
      await this.db.exec("COMMIT");
      return { order_id: orderId, status: "Paid" };
    } catch (e) {
      await this.db.exec("ROLLBACK");
      throw e;
    }
  }

}

module.exports = Checkout;
