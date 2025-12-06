import userService from '../../services/userService.js';
import { getCurrentUser } from '../../middleware/auth.js';

export const userResolvers = {
  Query: {
    /**
     * 👤 Get current authenticated user
     */
    getUser: (_, __, context) => getCurrentUser(context),
  },

  Mutation: {
    /**
     * ➕ Create new user
     */
    createUser: (_, { input }) => userService.createUser(input),

    /**
     * 🔑 Authenticate user and get token
     */
    authenticateUser: (_, { input }) => userService.authenticateUser(input),
  },
};
