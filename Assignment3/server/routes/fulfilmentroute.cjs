// server/routes/fulfilmentroute.cjs
const express = require("express");
const FulfilmentService = require("../backend/fulfilment.cjs");

module.exports = function fulfilmentRouterFactory(db) {
  const router = express.Router();
  const fulfilment = new FulfilmentService(db);

  // GET /api/fulfilment. list pending orders
  router.get("/", async (req, res) => {
    const rows = await fulfilment.listPending();
    res.json(rows);
  });

  // GET /api/fulfilment/:id/packaging-slip. get packaging slip details
  router.get("/:id/packaging-slip", async (req, res) => {
    const id = Number(req.params.id);
    const slip = await fulfilment.getPackagingSlip(id);
    res.json(slip);
  });

  // GET /api/fulfilment/:id. get single order with items
  router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const row = await fulfilment.getOrder(id);
    res.json(row);
  });

  // PUT /api/fulfilment/:id/status. status: "Packing"
  router.put("/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = await fulfilment.updateOrderStatus(id, status);
    res.json(updated);
  });

  // POST /api/fulfilment/:id/ship. ship the order - set to 'Shipped'
  router.post("/:id/ship", async (req, res) => {
    const id = Number(req.params.id);
    const updated = await fulfilment.shipOrder(id);
    res.json(updated);
  });

  return router;
};
