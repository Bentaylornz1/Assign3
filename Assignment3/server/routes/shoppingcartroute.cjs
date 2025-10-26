const express = require("express");
const ShoppingCart = require("../backend/shoppingcart.cjs");

module.exports = function shoppingCartRouterFactory(db) {
  const router = express.Router();
  const cart = new ShoppingCart(db);

  //get users cart
  router.get("/:userId", async (req, res) => {
    try {
      const result = await cart.getCart(req.params.userId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //add item to cart
  router.post("/:userId/items", async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
      const result = await cart.addItem(req.params.userId, product_id, quantity);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //update item quantity
  router.put("/:userId/items/:productId", async (req, res) => {
    try {
      const { quantity } = req.body;
      const result = await cart.updateItem(req.params.userId, req.params.productId, quantity);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //remove item from cart
  router.delete("/:userId/items/:productId", async (req, res) => {
    try {
      const result = await cart.removeItem(req.params.userId, req.params.productId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //clear cart
  router.delete("/:userId", async (req, res) => {
    try {
      const result = await cart.clearCart(req.params.userId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
