import { userResolvers } from './userResolvers.js';
import { productResolvers } from './productResolvers.js';
import { clientResolvers } from './clientResolvers.js';
import { orderResolvers } from './orderResolvers.js';

/**
 * 🎯 Combined GraphQL Resolvers
 * Organized by domain for better maintainability
 */

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...productResolvers.Query,
    ...clientResolvers.Query,
    ...orderResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...productResolvers.Mutation,
    ...clientResolvers.Mutation,
    ...orderResolvers.Mutation,
  },
};
