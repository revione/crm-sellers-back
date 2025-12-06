import Order from '../models/Order.js';
import Client from '../models/Client.js';
import { createError } from '../utils/validators.js';
import { requireAuth, requireOwnership } from '../middleware/auth.js';
import { ERROR_CODES, ORDER_STATES } from '../config/constants.js';
import productService from './productService.js';

class OrderService {
  /**
   * 📋 Gets all orders
   * @returns {Promise<Array>} List of orders
   */
  async getAllOrders() {
    return await Order.find()
      .populate('client', 'name lastname company email')
      .populate('seller', 'name lastname email')
      .sort({ date: -1 });
  }

  /**
   * 👤 Gets orders for a specific seller
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Array>} Seller's orders
   */
  async getOrdersBySeller(sellerId) {
    return await Order.find({ seller: sellerId })
      .populate('client', 'name lastname company email')
      .sort({ date: -1 });
  }

  /**
   * 🔍 Gets order by ID
   * @param {string} id - Order ID
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Order object
   */
  async getOrderById(id, context) {
    const order = await Order.findById(id)
      .populate('client', 'name lastname company email')
      .populate('seller', 'name lastname email');

    if (!order) {
      throw createError('Order not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(order.seller._id || order.seller, context);

    return order;
  }

  /**
   * 🎯 Gets orders by state
   * @param {string} state - Order state
   * @param {Object} context - GraphQL context
   * @returns {Promise<Array>} Matching orders
   */
  async getOrdersByState(state, context) {
    requireAuth(context);

    return await Order.find({ seller: context.user.id, state })
      .populate('client', 'name lastname company email')
      .sort({ date: -1 });
  }

  /**
   * ➕ Creates a new order
   * @param {Object} input - Order data
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Created order
   */
  async createOrder(input, context) {
    requireAuth(context);

    const { client: clientId, order: orderItems } = input;

    // Verify client exists and belongs to seller
    const client = await Client.findById(clientId);
    if (!client) {
      throw createError('Client not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(client.seller, context);

    // Process stock
    await productService.processStockForOrder(orderItems);

    // Map order items to include product reference
    const processedItems = orderItems.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
    }));

    // Create order
    const order = new Order({
      ...input,
      order: processedItems,
      seller: context.user.id,
    });

    await order.save();

    console.log(`✅ Order created: ${order.id} - Total: $${order.total}`);

    return await order.populate('client', 'name lastname company email');
  }

  /**
   * ✏️ Updates an order
   * @param {string} id - Order ID
   * @param {Object} input - Update data
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(id, input, context) {
    const order = await Order.findById(id);

    if (!order) {
      throw createError('Order not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(order.seller, context);

    // If updating order items, handle stock
    if (input.order && input.order.length > 0) {
      // Restore old stock
      await productService.restoreStockForOrder(order.order);

      // Process new stock
      await productService.processStockForOrder(input.order);

      // Map new items
      input.order = input.order.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
      }));
    }

    // Don't allow changing seller or client
    delete input.seller;
    delete input.client;

    Object.assign(order, input);
    await order.save();

    console.log(`✅ Order updated: ${order.id}`);

    return await order.populate('client', 'name lastname company email');
  }

  /**
   * 🗑️ Deletes an order
   * @param {string} id - Order ID
   * @param {Object} context - GraphQL context
   * @returns {Promise<string>} Success message
   */
  async deleteOrder(id, context) {
    const order = await Order.findById(id);

    if (!order) {
      throw createError('Order not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(order.seller, context);

    // If order was pending, restore stock
    if (order.state === ORDER_STATES.PENDING) {
      await productService.restoreStockForOrder(order.order);
    }

    await Order.findByIdAndDelete(id);

    console.log(`✅ Order deleted: ${id}`);
    return 'Order deleted successfully';
  }

  /**
   * 📊 Gets top clients by total sales
   * @returns {Promise<Array>} Top clients
   */
  async getTopClients() {
    return await Order.aggregate([
      { $match: { state: ORDER_STATES.COMPLETED } },
      {
        $group: {
          _id: '$client',
          total: { $sum: '$total' },
        },
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
  }

  /**
   * 🏆 Gets top sellers by total sales
   * @returns {Promise<Array>} Top sellers
   */
  async getTopSellers() {
    return await Order.aggregate([
      { $match: { state: ORDER_STATES.COMPLETED } },
      {
        $group: {
          _id: '$seller',
          total: { $sum: '$total' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $sort: { total: -1 } },
      { $limit: 3 },
    ]);
  }
}

export default new OrderService();
