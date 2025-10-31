const express = require("express");
const Catalogue = require("../backend/catalogue.cjs");

module.exports = function catalogueRouterFactory(db) {
  const router = express.Router();
  const catalogue = new Catalogue(db);

  //get all active products (for customers)
  router.get("/", async (req, res) => {
    const rows = await catalogue.listAll();
    res.json(rows);
  });

  //get all products including inactive (for admin)
  router.get("/all", async (req, res) => {
    const rows = await catalogue.listAllIncludingInactive();
    res.json(rows);
  });

  //search products
  router.get("/search", async (req, res) => {
    const { q } = req.query;
    const results = await catalogue.searchByName(q || "");
    res.json(results);
  });

  //get single product
  router.get("/:id", async (req, res) => {
    const product = await catalogue.getProduct(req.params.id);
    res.json(product);
  });

  //add product 
  router.post("/", async (req, res) => {
    const result = await catalogue.addProduct(req.body);
    res.status(201).json(result);
  });

  //update product
  router.put("/:id", async (req, res) => {
    const updated = await catalogue.updateProduct(req.params.id, req.body);
    res.json(updated);
  });

  //toggle products status
  router.patch("/:id/active", async (req, res) => {
    const { is_active } = req.body;
    const updated = await catalogue.toggleActive(req.params.id, is_active);
    res.json(updated);
  });

  //delete product
  router.delete("/:id", async (req, res) => {
    const result = await catalogue.deleteProduct(req.params.id);
    res.json(result);
  });

  return router;
};
