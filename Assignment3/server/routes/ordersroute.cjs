// server/routes/orders.cjs
const express = require("express");
const OrderService = require("../backend/orders.cjs");

module.exports = function ordersRouterFactory(db) {
  const router = express.Router();
  const orders = new OrderService(db);

  // List all orders (admin/simple)
  router.get("/", async (req, res) => {
    try {
      const rows = await orders.listAll();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // List orders by user
  router.get("/user/:userId", async (req, res) => {
    try {
      const rows = await orders.listByUser(req.params.userId);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get a single order (with items)
  router.get("/:id", async (req, res) => {
    try {
      const data = await orders.getOrderWithItems(req.params.id);
      if (!data) return res.status(404).json({ error: "Order not found" });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Invoice
  router.get("/:id/invoice", async (req, res) => {
    try {
      const invoice = await orders.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ error: "Order not found" });
      // Ensure numeric values for front-end formatting
      invoice.subtotal = Number(invoice.subtotal);
      invoice.total    = Number(invoice.total);
      res.json(invoice);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Receipt
  router.get("/:id/receipt", async (req, res) => {
    try {
      const receipt = await orders.getReceipt(req.params.id);
      if (!receipt) return res.status(404).json({ error: "Order not found" });
      res.json(receipt);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update order status (simple)
  router.patch("/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await orders.updateStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Order not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Tiny stats endpoint (optional)
  router.get("/stats/summary", async (req, res) => {
    try {
      const { from, to } = req.query; // ISO strings recommended
      const summary = await orders.getStatsSummary({ from, to });
      res.json(summary);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
