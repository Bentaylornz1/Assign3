// server/routes/statsroute.cjs
const express = require("express");
const StatsService = require("../backend/stats.cjs");

module.exports = function statsRouterFactory(db) {
  const router = express.Router();
  const stats = new StatsService(db);

  // GET /api/stats/sales?from=ISO&to=ISO
  router.get("/sales", async (req, res) => {
    try {
      const { from, to } = req.query;
      const summary = await stats.salesSummary({ from, to });
      res.json(summary);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/stats/top-products?limit=5&from=ISO&to=ISO
  router.get("/top-products", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const { from, to } = req.query;
      const top = await stats.topProducts({ limit, from, to });
      res.json(top);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/stats/by-status
  router.get("/by-status", async (req, res) => {
    try {
      const byStatus = await stats.ordersByStatus();
      res.json(byStatus);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
