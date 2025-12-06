import productService from '../../services/productService.js';

export const productResolvers = {
  Query: {
    /**
     * 📦 Get all products
     */
    getProducts: () => productService.getAllProducts(),

    /**
     * 🔍 Get single product by ID
     */
    getProduct: (_, { id }) => productService.getProductById(id),

    /**
     * 🔎 Search products by text
     */
    searchProducts: (_, { text }) => productService.searchProducts(text),
  },

  Mutation: {
    /**
     * ➕ Create new product
     */
    createProduct: (_, { input }) => productService.createProduct(input),

    /**
     * ✏️ Update product
     */
    updateProduct: (_, { id, input }) => productService.updateProduct(id, input),

    /**
     * 🗑️ Delete product
     */
    deleteProduct: (_, { id }) => productService.deleteProduct(id),
  },
};
