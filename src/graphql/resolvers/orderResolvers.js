import orderService from '../../services/orderService.js';
import { getCurrentUser } from '../../middleware/auth.js';

export const orderResolvers = {
  Query: {
    /**
     * 📋 Get all orders
     */
    getOrders: () => orderService.getAllOrders(),

    /**
     * 👤 Get orders for current seller
     */
    getOrdersSeller: (_, __, context) => {
      const user = getCurrentUser(context);
      return orderService.getOrdersBySeller(user.id);
    },

    /**
     * 🔍 Get single order by ID
     */
    getOrder: (_, { id }, context) => orderService.getOrderById(id, context),

    /**
     * 🎯 Get orders by state
     */
    getOrdersState: (_, { state }, context) => orderService.getOrdersByState(state, context),

    /**
     * 🏆 Get top clients
     */
    bestClients: () => orderService.getTopClients(),

    /**
     * 🏆 Get top sellers
     */
    bestSellers: () => orderService.getTopSellers(),
  },

  Mutation: {
    /**
     * ➕ Create new order
     */
    createOrder: (_, { input }, context) => orderService.createOrder(input, context),

    /**
     * ✏️ Update order
     */
    updateOrder: (_, { id, input }, context) => orderService.updateOrder(id, input, context),

    /**
     * 🗑️ Delete order
     */
    deleteOrder: (_, { id }, context) => orderService.deleteOrder(id, context),
  },
};
