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
    ///////////THIS IS AI SEED DATA TO SHOW THE SYSTEM WORKING, SPECIFICALLY FOR THE STATISTICS
    /////////// SEED PAST MONTH ORDERS
    // --- SEED ORDERS FROM PAST MONTH FOR STATS ---
    const existingOrders = await db.get(`SELECT COUNT(*) as count FROM orders`);
    if (existingOrders.count === 0) {
      console.log("Seeding past month orders...");

      const products = [
        [1, 'Classic Cola 330ml', 2.50],
        [2, 'Water 500ml', 1.80],
        [3, 'Salted Chips 150g', 3.20],
        [4, 'Chocolate Bar 50g', 2.20],
        [5, 'Instant Noodles', 2.00]
      ];

      const today = new Date();
      
      const orderTemplates = [
        { items: [[1, 2], [3, 1]], status: 'Delivered', address: '123 Main St, Melbourne VIC 3000' },
        { items: [[2, 5], [4, 2]], status: 'Delivered', address: '45 Oak Avenue, Sydney NSW 2000' },
        { items: [[1, 1], [3, 2], [5, 3]], status: 'Delivered', address: '78 Pine Road, Brisbane QLD 4000' },
        { items: [[4, 4]], status: 'Delivered', address: '12 Elm Street, Perth WA 6000' },
        { items: [[2, 3], [1, 2]], status: 'Delivered', address: '99 River Drive, Adelaide SA 5000' },
        { items: [[3, 1], [4, 1], [5, 2]], status: 'Delivered', address: '56 Park Lane, Hobart TAS 7000' },
        { items: [[1, 3], [2, 2]], status: 'Delivered', address: '23 Beach Road, Gold Coast QLD 4217' },
        { items: [[5, 5]], status: 'Delivered', address: '34 Mountain View, Canberra ACT 2600' },
        { items: [[3, 2], [4, 3]], status: 'Delivered', address: '67 Garden Way, Darwin NT 0800' },
        { items: [[1, 4], [2, 1], [5, 2]], status: 'Delivered', address: '89 Harbor Street, Melbourne VIC 3000' },
        { items: [[2, 6], [3, 1]], status: 'Delivered', address: '11 Sunset Boulevard, Sydney NSW 2000' },
        { items: [[4, 5], [1, 2]], status: 'Delivered', address: '22 Valley Road, Brisbane QLD 4000' },
        { items: [[5, 3], [3, 2]], status: 'Delivered', address: '33 Coast Highway, Perth WA 6000' },
        { items: [[1, 5], [4, 2], [2, 3]], status: 'Delivered', address: '44 Hill Street, Adelaide SA 5000' },
        { items: [[3, 3], [5, 1]], status: 'Delivered', address: '55 Forest Drive, Hobart TAS 7000' },
        { items: [[2, 4], [1, 3]], status: 'Delivered', address: '66 Ocean View, Gold Coast QLD 4217' },
        { items: [[4, 6], [3, 1], [5, 2]], status: 'Delivered', address: '77 Skyline Road, Canberra ACT 2600' },
        { items: [[1, 2], [2, 5]], status: 'Delivered', address: '88 Desert Lane, Darwin NT 0800' },
        { items: [[5, 4], [4, 1]], status: 'Delivered', address: '19 Green Street, Melbourne VIC 3000' },
        { items: [[3, 4], [2, 2], [1, 1]], status: 'Delivered', address: '20 Blue Avenue, Sydney NSW 2000' },
        { items: [[4, 3], [5, 3]], status: 'Delivered', address: '21 Red Circle, Brisbane QLD 4000' },
        { items: [[1, 6], [3, 2]], status: 'Delivered', address: '24 Yellow Way, Perth WA 6000' },
        { items: [[2, 7], [4, 1], [5, 1]], status: 'Delivered', address: '25 Purple Drive, Adelaide SA 5000' },
        { items: [[3, 5], [1, 2]], status: 'Delivered', address: '26 Orange Road, Hobart TAS 7000' }
      ];

      const specificDateOrders = [
        { items: [[1, 3], [3, 2]], status: 'Paid', address: '101 Commerce Street, Melbourne VIC 3000', dateStr: '30/10' },
        { items: [[2, 4], [4, 1]], status: 'Packing', address: '202 Business Avenue, Sydney NSW 2000', dateStr: '30/10' },
        { items: [[5, 5], [1, 2]], status: 'Paid', address: '303 Trade Road, Brisbane QLD 4000', dateStr: '29/10' },
        { items: [[3, 3], [2, 3]], status: 'Packing', address: '404 Market Lane, Perth WA 6000', dateStr: '29/10' },
        { items: [[4, 2], [5, 4], [1, 1]], status: 'Paid', address: '505 Retail Boulevard, Adelaide SA 5000', dateStr: '28/10' }
      ];

      const createOrder = async (template, orderDate) => {
        let orderTotal = 0;
        template.items.forEach(([productId, quantity]) => {
          const product = products.find(p => p[0] === productId);
          if (product) {
            orderTotal += product[2] * quantity;
          }
        });

        const orderResult = await db.run(
          `INSERT INTO orders (user_id, shipping_address, order_total, order_status, order_date)
           VALUES (?, ?, ?, ?, ?)`,
          2, 
          template.address,
          orderTotal.toFixed(2),
          template.status,
          orderDate.toISOString()
        );

        const orderId = orderResult.lastID;

        for (const [productId, quantity] of template.items) {
          const product = products.find(p => p[0] === productId);
          if (product) {
            await db.run(
              `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
               VALUES (?, ?, ?, ?, ?)`,
              orderId,
              productId,
              product[1],
              quantity,
              product[2]
            );
          }
        }
      };

      for (let i = 0; i < orderTemplates.length; i++) {
        const template = orderTemplates[i];
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date(today);
        orderDate.setDate(orderDate.getDate() - daysAgo);
        orderDate.setHours(Math.floor(Math.random() * 24));
        orderDate.setMinutes(Math.floor(Math.random() * 60));
        
        await createOrder(template, orderDate);
      }

      const currentYear = today.getFullYear();
      for (const template of specificDateOrders) {
        const [day, month] = template.dateStr.split('/');
        const orderDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        orderDate.setHours(Math.floor(Math.random() * 24));
        orderDate.setMinutes(Math.floor(Math.random() * 60));
        
        await createOrder(template, orderDate);
      }

      console.log(`Seeded ${orderTemplates.length} orders from the past month and ${specificDateOrders.length} orders for specific dates`);
    } else {
      console.log(`${existingOrders.count} order(s) already exist — skipping order seed.`);
    }
    /////////// END OF PAST MONTH ORDERS SEED
    // ==================================================

    const checkoutRouter = require("./routes/checkoutroute.cjs")(db);
    app.use("/api/checkout", checkoutRouter);

    const ordersRouter = require("./routes/ordersroute.cjs")(db);
    app.use("/api/orders", ordersRouter);

    const catalogueRouter = require("./routes/catalogueroute.cjs")(db);
    app.use("/api/catalogue", catalogueRouter);

    const shoppingCartRouter = require("./routes/shoppingcartroute.cjs")(db);
    app.use("/api/cart", shoppingCartRouter);

    const fulfilmentRouter = require("./routes/fulfilmentroute.cjs")(db);
    app.use("/api/fulfilment", fulfilmentRouter);

    const statsRouter = require("./routes/statsroute.cjs")(db);
    app.use("/api/stats", statsRouter);




    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();