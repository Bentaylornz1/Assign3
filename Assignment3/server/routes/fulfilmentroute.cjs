// server/routes/fulfilmentroute.cjs
const express = require("express");
const FulfilmentService = require("../backend/fulfilment.cjs");

module.exports = function fulfilmentRouterFactory(db) {
  const router = express.Router();
  const fulfilment = new FulfilmentService(db);

  // GET /api/fulfilment          -> list pending orders
  router.get("/", async (req, res) => {
    try {
      const rows = await fulfilment.listPending();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/fulfilment/:id      -> get single order with items
  router.get("/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await fulfilment.getOrder(id);
      if (!row) return res.status(404).json({ error: "Order not found" });
      res.json(row);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PUT /api/fulfilment/:id/status  -> body: { status: "Packing" }
  router.put("/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status required" });
      const updated = await fulfilment.updateOrderStatus(id, status);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/fulfilment/:id/ship   -> ship the order (decrement stock, set to 'Shipped')
  router.post("/:id/ship", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await fulfilment.shipOrder(id);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
};
