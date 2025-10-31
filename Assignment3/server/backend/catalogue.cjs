class Catalogue {
  constructor(db) {
    this.db = db;
  }

  //fetch all products (for customer) - only active products
  async listAll() {
    return await this.db.all(
      `SELECT * FROM products WHERE is_active = 1 ORDER BY product_id ASC`
    );
  }

  //fetch all products including inactive (for admin)
  async listAllIncludingInactive() {
    return await this.db.all(
      `SELECT * FROM products ORDER BY product_id ASC`
    );
  }

  //fetch single product by ID
  async getProduct(id) {
    return await this.db.get(
      `SELECT * FROM products WHERE product_id = ?`,
      id
    );
  }

  //admin operations
  //ddd new product
  async addProduct({ name, description, price, stock }) {
    const result = await this.db.run(
      `INSERT INTO products (name, description, price, stock)
       VALUES (?, ?, ?, ?)`,
      name, description, price, stock
    );
    return await this.getProduct(result.lastID);
  }

  //update an existing product
  async updateProduct(id, { name, description, price, stock }) {
    await this.db.run(
      `UPDATE products
       SET name = ?, description = ?, price = ?, stock = ?
       WHERE product_id = ?`,
      name, description, price, stock, id
    );
    return await this.getProduct(id);
  }

  //delete a product
  async deleteProduct(id) {
    await this.db.run(`DELETE FROM products WHERE product_id = ?`, id);
    return { message: `Product ${id} deleted` };
  }

  //set as active or inactive
  async toggleActive(productId, active) {
    await this.db.run(
      `UPDATE products SET is_active = ? WHERE product_id = ?`,
      active ? 1 : 0,
      productId
    );
    return await this.getProduct(productId);
  }

  //search catalogue
  async searchByName(query) {
    return await this.db.all(
      `SELECT * FROM products WHERE name LIKE ? AND is_active = 1`,
      `%${query}%`
    );
  }
}

module.exports = Catalogue;
