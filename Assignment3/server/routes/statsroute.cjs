// server/routes/statsroute.cjs
const express = require("express");
const StatsService = require("../backend/stats.cjs");

module.exports = function statsRouterFactory(db) {
  const router = express.Router();
  const stats = new StatsService(db);

  // GET /api/stats/sales?from --- to
  router.get("/sales", async (req, res) => {
    const { from, to } = req.query;
    const summary = await stats.salesSummary({ from, to });
    res.json(summary);
  });

  // GET /api/stats/top-products?from --- to
  router.get("/top-products", async (req, res) => {
    const limit = Number(req.query.limit) || 5;
    const { from, to } = req.query;
    const top = await stats.topProducts({ limit, from, to });
    res.json(top);
  });

  // GET /api/stats/by-status
  router.get("/by-status", async (req, res) => {
    const byStatus = await stats.ordersByStatus();
    res.json(byStatus);
  });

  // GET /api/stats/orders?from --- to
  router.get("/orders", async (req, res) => {
    const { from, to } = req.query;
    const orders = await stats.getOrdersByDateRange({ from, to });
    res.json(orders);
  });

  // GET /api/stats/products-sold?from --- to
  router.get("/products-sold", async (req, res) => {
    const { from, to } = req.query;
    const products = await stats.getAllProductsSold({ from, to });
    res.json(products);
  });

  return router;
};
