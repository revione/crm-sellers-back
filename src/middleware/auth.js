import { GraphQLError } from 'graphql';
import { ERROR_CODES } from '../config/constants.js';

/**
 * 🔐 Ensures user is authenticated
 * @param {Object} context - GraphQL context
 * @throws {GraphQLError} If user is not authenticated
 */
export const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required. Please log in.', {
      extensions: {
        code: ERROR_CODES.UNAUTHENTICATED,
        http: { status: 401 },
      },
    });
  }
};

/**
 * 🛡️ Ensures user owns the resource
 * @param {string} resourceOwnerId - ID of resource owner
 * @param {Object} context - GraphQL context
 * @throws {GraphQLError} If user doesn't own the resource
 */
export const requireOwnership = (resourceOwnerId, context) => {
  requireAuth(context);

  if (resourceOwnerId.toString() !== context.user.id) {
    throw new GraphQLError('Access denied. You do not own this resource.', {
      extensions: {
        code: ERROR_CODES.FORBIDDEN,
        http: { status: 403 },
      },
    });
  }
};

/**
 * ✅ Optional authentication (doesn't throw if not authenticated)
 * @param {Object} context - GraphQL context
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = (context) => {
  return !!context.user;
};

/**
 * 🔍 Gets current user or throws
 * @param {Object} context - GraphQL context
 * @returns {Object} Current user
 * @throws {GraphQLError} If not authenticated
 */
export const getCurrentUser = (context) => {
  requireAuth(context);
  return context.user;
};
