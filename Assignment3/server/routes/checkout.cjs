// server/routes/checkout.cjs
const express = require("express");
const Checkout = require("../backend/checkout.cjs");

module.exports = function checkoutRouterFactory(db) {
  const router = express.Router();
  const checkout = new Checkout(db);

  // 1. QUOTE — compute totals for the current cart
  router.post("/quote", async (req, res) => {
    try {
      const { user_id, shipping_address } = req.body;

      // get cart items for this user
      const lines = await db.all(
        `SELECT p.product_id, p.name, p.price, ci.quantity
         FROM cart_items ci
         JOIN products p ON p.product_id = ci.product_id
         JOIN shopping_carts sc ON ci.cart_id = sc.cart_id
         WHERE sc.user_id = ?`,
        user_id
      );

      const totals = checkout.computeOrderTotal(lines);
      res.json({ user_id, shipping_address, totals, items: lines });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. CREATE — make a new order from cart
  router.post("/create", async (req, res) => {
    try {
      const { user_id, shipping_address } = req.body;

      // fetch cart lines
      const lines = await db.all(
        `SELECT p.product_id, p.name, p.price, ci.quantity
         FROM cart_items ci
         JOIN products p ON p.product_id = ci.product_id
         JOIN shopping_carts sc ON ci.cart_id = sc.cart_id
         WHERE sc.user_id = ?`,
        user_id
      );

      const { total } = checkout.computeOrderTotal(lines);
      const orderId = await checkout.createOrderFromCart(user_id, shipping_address, lines, total);

      res.json({ order_id: orderId, status: "Pending", total });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3️. PAY — mark paid, clear cart, deliver instantly
  router.post("/pay", async (req, res) => {
    try {
      const { order_id, user_id } = req.body;

      await checkout.initiatePayment(order_id);
      const receipt = await checkout.issueReceipt(order_id);
      await checkout.clearShoppingCart(user_id);
      const fulfil = await checkout.triggerFulfilment(order_id);

      res.json({
        message: "Payment successful. Order delivered instantly.",
        ...fulfil,
        receipt
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
