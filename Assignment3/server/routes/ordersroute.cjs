// server/routes/orders.cjs
const express = require("express");
const OrderService = require("../backend/orders.cjs");

module.exports = function ordersRouterFactory(db) {
  const router = express.Router();
  const orders = new OrderService(db);

  // List all orders (admin/simple)
  router.get("/", async (req, res) => {
    const rows = await orders.listAll();
    res.json(rows);
  });

  // List orders by user
  router.get("/user/:userId", async (req, res) => {
    const rows = await orders.listByUser(req.params.userId);
    res.json(rows);
  });

  // Get a single order (with items)
  router.get("/:id", async (req, res) => {
    const data = await orders.getOrderWithItems(req.params.id);
    res.json(data);
  });

  // Invoice
  router.get("/:id/invoice", async (req, res) => {
    const invoice = await orders.getInvoice(req.params.id);
    invoice.subtotal = Number(invoice.subtotal);
    invoice.total    = Number(invoice.total);
    res.json(invoice);
  });

  // Receipt
  router.get("/:id/receipt", async (req, res) => {
    const receipt = await orders.getReceipt(req.params.id);
    res.json(receipt);
  });

  // Update order status (simple)
  router.patch("/:id/status", async (req, res) => {
    const { status } = req.body;
    const updated = await orders.updateStatus(req.params.id, status);
    res.json(updated);
  });

  // Tiny stats endpoint (optional)
  router.get("/stats/summary", async (req, res) => {
    const { from, to } = req.query;
    const summary = await orders.getStatsSummary({ from, to });
    res.json(summary);
  });

  return router;
};
