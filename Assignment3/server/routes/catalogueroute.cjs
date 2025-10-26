const express = require("express");
const Catalogue = require("../backend/catalogue.cjs");

module.exports = function catalogueRouterFactory(db) {
  const router = express.Router();
  const catalogue = new Catalogue(db);

  //get all active products
  router.get("/", async (req, res) => {
    try {
      const rows = await catalogue.listAll(false);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //search products
  router.get("/search", async (req, res) => {
    try {
      const { q } = req.query;
      const results = await catalogue.searchByName(q || "");
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //get single product
  router.get("/:id", async (req, res) => {
    try {
      const product = await catalogue.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //add product 
  router.post("/", async (req, res) => {
    try {
      const result = await catalogue.addProduct(req.body);
      res.status(201).json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //update product
  router.put("/:id", async (req, res) => {
    try {
      const updated = await catalogue.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //toggle products status
  router.patch("/:id/active", async (req, res) => {
    try {
      const { is_active } = req.body;
      const updated = await catalogue.toggleActive(req.params.id, is_active);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //delete product
  router.delete("/:id", async (req, res) => {
    try {
      const result = await catalogue.deleteProduct(req.params.id);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
