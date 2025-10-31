class ShoppingCart {
  constructor(db) {
    this.db = db;
  }

  //get a users cart with products
  async getCart(userId) {
    const cart = await this.db.get(
      `SELECT * FROM shopping_carts WHERE user_id = ?`,
      userId
    );
    if (!cart) return { cart_id: null, user_id: userId, items: [], item_count: 0, total: 0 };

    const items = await this.db.all(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.name, p.description, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      cart.cart_id
    );

    //item count and items total price to show on shopping cart page
    const item_count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return { 
      cart_id: cart.cart_id, 
      user_id: userId, 
      items,
      item_count,
      total: parseFloat(total.toFixed(2))
    };
  }

  //add an item to a users cart
  async addItem(userId, productId, quantity = 1) {
    //check cart exists
    let cart = await this.db.get(
      `SELECT * FROM shopping_carts WHERE user_id = ?`,
      userId
    );
    if (!cart) {
      const result = await this.db.run(
        `INSERT INTO shopping_carts (user_id) VALUES (?)`,
        userId
      );
      cart = { cart_id: result.lastID, user_id: userId };
    }

    //check if product already exists in cart
    const existing = await this.db.get(
      `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      cart.cart_id, productId
    );

    if (existing) {
      //update quantity
      await this.db.run(
        `UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?`,
        quantity, existing.cart_item_id
      );
    } else {
      //insert new item
      await this.db.run(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        cart.cart_id, productId, quantity
      );
    }

    return this.getCart(userId);
  }

  //update quantity for a cart item
  async updateItem(userId, productId, quantity) {
    const cart = await this.db.get(
      `SELECT * FROM shopping_carts WHERE user_id = ?`,
      userId
    );

    if (quantity <= 0) {
      //remove item if quantity zero or negative
      await this.db.run(
        `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        cart.cart_id, productId
      );
    } else {
      await this.db.run(
        `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
        quantity, cart.cart_id, productId
      );
    }

    return this.getCart(userId);
  }

  //remove an item from cart
  async removeItem(userId, productId) {
    const cart = await this.db.get(
      `SELECT * FROM shopping_carts WHERE user_id = ?`,
      userId
    );
    if (!cart) return { message: "Cart not found" };

    await this.db.run(
      `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      cart.cart_id, productId
    );

    return this.getCart(userId);
  }

  //clear cart
  async clearCart(userId) {
    const cart = await this.db.get(
      `SELECT * FROM shopping_carts WHERE user_id = ?`,
      userId
    );
    if (!cart) return { message: "Cart not found" };

    await this.db.run(
      `DELETE FROM cart_items WHERE cart_id = ?`,
      cart.cart_id
    );

    return { message: "Cart cleared" };
  }
}

module.exports = ShoppingCart;
