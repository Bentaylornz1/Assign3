// server.cjs (CommonJS version)
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      order_total REAL NOT NULL,
      order_status TEXT DEFAULT 'Pending',
      order_date TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(order_id)
    )
  `);

  console.log("Orders and order_items tables are ready");
})();

app.post("/create-order", async (req, res) => {
  try {
    const { customer_name, shipping_address, products } = req.body;
    if (!customer_name || !shipping_address || !products || !products.length) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const order_total = products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const result = await db.run(
      `INSERT INTO orders (customer_name, shipping_address, order_total) VALUES (?, ?, ?)`,
      customer_name,
      shipping_address,
      order_total
    );

    const order_id = result.lastID;

    for (const item of products) {
      await db.run(
        `INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`,
        order_id,
        item.product_name,
        item.quantity,
        item.price
      );
    }

    res.json({ message: "Order created successfully", order_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

