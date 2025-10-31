// server/routes/checkout.cjs
const express = require("express");
const Checkout = require("../backend/checkout.cjs");

module.exports = function checkoutRouterFactory(db) {
  const router = express.Router();
  const checkout = new Checkout(db);

  //QUOTE — compute totals for the current cart
  router.post("/quote", async (req, res) => {
    const { user_id, shipping_address } = req.body;
    const lines = await checkout.getCartLines(user_id);
    const totals = checkout.computeOrderTotal(lines);
    res.json({ user_id, shipping_address, totals, items: lines });
  });

  // 2. CREATE — make a new order from cart
  router.post("/create", async (req, res) => {
    const { user_id, shipping_address } = req.body;
    const { orderId, totals } = await checkout.createOrderFromCart(user_id, shipping_address);
    res.json({ order_id: orderId, status: "Pending", total: totals.total });
  });

  // 3️. PAY — mark paid, clear cart
  router.post("/pay", async (req, res) => {
    const { order_id, user_id } = req.body;
    await checkout.assertOrderBelongsToUser(order_id, user_id);
    const paymentResult = await checkout.initiatePayment(order_id);
    const receipt = await checkout.issueReceipt(order_id);
    await checkout.clearShoppingCart(user_id);
    res.json({ message: "Payment successful.", ...paymentResult, receipt });
  });

  // 4. GET INVOICE — get invoice for an order
  router.get("/invoice/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const invoice = await checkout.generateInvoice(orderId);
    res.json(invoice);
  });

  return router;
};
