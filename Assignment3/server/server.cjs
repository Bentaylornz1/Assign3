// server.cjs (CommonJS version)
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
  try {
    db = await open({
      filename: "./database.db",
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON;");

    // 1) USERS
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        role          TEXT NOT NULL CHECK (role IN ('ADMIN','CUSTOMER')),
        email         TEXT NOT NULL UNIQUE,
        password      TEXT NOT NULL,
        name          TEXT NOT NULL
      )
    `);

    // Seed default users once
    // MAYBE MOVE THIS INTO ENDPOINTS LATER 
    const existing = await db.get(`SELECT COUNT(*) as count FROM users`);
    if (existing.count === 0) {
      await db.run(`
        INSERT INTO users (role, email, password, name)
        VALUES
          ('ADMIN', 'admin@yourlocalshop.com', 'admin123', 'Admin'),
          ('CUSTOMER', 'customer@yourlocalshop.com', 'customer123', 'Customer')
      `);
    }

    // 2) PRODUCTS (Catalogue)
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        product_id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        description  TEXT,
        price        REAL NOT NULL,
        stock        INTEGER NOT NULL DEFAULT 0,
        is_active    INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Seed default products on launch
    // MAYBE MOVE THIS INTO ENDPOINTS LATER 
    const existingProducts = await db.get(`SELECT COUNT(*) as count FROM products`);
    if (existingProducts.count === 0) {
      await db.run(`
        INSERT INTO products (name, description, price, stock)
        VALUES
          ('Classic Cola 330ml', 'Sparkling soft drink', 2.50, 200),
          ('Water 500ml', 'No sugar, refreshing drink', 1.80, 300),
          ('Salted Chips 150g', 'Crispy salted potato chips', 3.20, 150),
          ('Chocolate Bar 50g', 'Smooth milk chocolate bar', 2.20, 180),
          ('Instant Noodles', 'Chicken Flavour', 2.00, 120)
      `);
      console.log("Products seeded");
    } else {
      console.log(`${existingProducts.count} products already exist — skipping seed.`);
    }


    // 3) SHOPPING CARTS + CART ITEMS
    await db.run(`
      CREATE TABLE IF NOT EXISTS shopping_carts (
        cart_id    INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id      INTEGER NOT NULL REFERENCES shopping_carts(cart_id) ON DELETE CASCADE,
        product_id   INTEGER NOT NULL REFERENCES products(product_id),
        quantity     INTEGER NOT NULL CHECK (quantity > 0),
        UNIQUE (cart_id, product_id)
      )
    `);

    // 4) ORDERS
    await db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id           INTEGER NOT NULL REFERENCES users(user_id),
        shipping_address  TEXT NOT NULL,
        order_total       REAL NOT NULL,
        order_status      TEXT NOT NULL
                          CHECK (order_status IN ('Pending','Paid','Packing','Shipped','Delivered'))
                          DEFAULT 'Pending',
        order_date        TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5) ORDER ITEMS
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        item_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id      INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id    INTEGER REFERENCES products(product_id),
        product_name  TEXT NOT NULL,
        quantity      INTEGER NOT NULL,
        price         REAL NOT NULL
      )
    `);

    // ==================================================
    /////////// REMOVE THIS LATE - AI SEED DATA JUST TO TEST THE CHECKOUT AND ORDER ENDPOINTS
    // --- SEED SHOPPING CART + ITEMS FOR TESTING ---
    const existingCart = await db.get(`SELECT COUNT(*) as count FROM shopping_carts`);
    if (existingCart.count === 0) {
      console.log("Seeding sample shopping cart...");

      // create a cart for user_id = 2 (the customer)
      const cartResult = await db.run(`INSERT INTO shopping_carts (user_id) VALUES (2)`);
      const cartId = cartResult.lastID;

      // add 2 products to that cart
      await db.run(`
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES
          (?, 1, 2),   -- 2 Classic Colas
          (?, 3, 1)    -- 1 Salted Chips
      `, cartId, cartId);

      console.log("Shopping cart seeded ✅");
    } else {
      console.log(`${existingCart.count} cart(s) already exist — skipping cart seed.`);
    }
    /////////// END OF AI SEED DATA
    // ==================================================

    const checkoutRouter = require("./routes/checkoutroute.cjs")(db);
    app.use("/api/checkout", checkoutRouter);

    const ordersRouter = require("./routes/ordersroute.cjs")(db);
    app.use("/api/orders", ordersRouter);

    const catalogueRouter = require("./routes/catalogueroute.cjs")(db);
    app.use("/api/catalogue", catalogueRouter);

    const shoppingCartRouter = require("./routes/shoppingcartroute.cjs")(db);
    app.use("/api/cart", shoppingCartRouter);




    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
