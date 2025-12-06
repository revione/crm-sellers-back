import Product from '../models/Product.js';
import { createError } from '../utils/validators.js';
import { ERROR_CODES } from '../config/constants.js';

class ProductService {
  /**
   * 📦 Gets all products
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of products
   */
  async getAllProducts(filters = {}) {
    const query = { active: true, ...filters };
    return await Product.find(query).sort({ created: -1 });
  }

  /**
   * 🔍 Gets product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  async getProductById(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError('Product not found', ERROR_CODES.NOT_FOUND);
    }

    return product;
  }

  /**
   * 🔎 Search products by text
   * @param {string} searchText - Text to search
   * @returns {Promise<Array>} Matching products
   */
  async searchProducts(searchText) {
    return await Product.find(
      { $text: { $search: searchText }, active: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
  }

  /**
   * ➕ Creates a new product
   * @param {Object} input - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(input) {
    const product = new Product(input);
    await product.save();

    console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);
    return product;
  }

  /**
   * ✏️ Updates a product
   * @param {string} id - Product ID
   * @param {Object} input - Update data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, input) {
    const product = await Product.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw createError('Product not found', ERROR_CODES.NOT_FOUND);
    }

    console.log(`✅ Product updated: ${product.name}`);
    return product;
  }

  /**
   * 🗑️ Deletes a product (soft delete)
   * @param {string} id - Product ID
   * @returns {Promise<string>} Success message
   */
  async deleteProduct(id) {
    const product = await Product.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!product) {
      throw createError('Product not found', ERROR_CODES.NOT_FOUND);
    }

    console.log(`✅ Product deleted: ${product.name}`);
    return 'Product deleted successfully';
  }

  /**
   * 📊 Checks and updates product stock
   * @param {Array} orderItems - Items to process
   * @returns {Promise<void>}
   */
  async processStockForOrder(orderItems) {
    for (const item of orderItems) {
      const product = await this.getProductById(item.id || item.product);

      if (item.quantity > product.existence) {
        throw createError(
          `Insufficient stock for "${product.name}". Available: ${product.existence}, Requested: ${item.quantity}`,
          ERROR_CODES.BAD_USER_INPUT
        );
      }

      // Decrease stock
      product.existence -= item.quantity;
      await product.save();

      console.log(
        `📦 Stock updated: ${product.name} - Remaining: ${product.existence}`
      );
    }
  }

  /**
   * 🔄 Restores product stock (for order cancellation)
   * @param {Array} orderItems - Items to restore
   * @returns {Promise<void>}
   */
  async restoreStockForOrder(orderItems) {
    for (const item of orderItems) {
      const product = await this.getProductById(item.product);

      product.existence += item.quantity;
      await product.save();

      console.log(`🔄 Stock restored: ${product.name} - New stock: ${product.existence}`);
    }
  }
}

export default new ProductService();
