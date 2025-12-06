/**
 * 🔧 Application configuration constants
 */

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  EXPIRES_IN: '24h',
  ALGORITHM: 'HS256',
};

export const BCRYPT_CONFIG = {
  SALT_ROUNDS: 10,
};

export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT, 10) || 4000,
  ENV: process.env.NODE_ENV || 'development',
};

export const DATABASE_CONFIG = {
  URI: process.env.DB_MONGO || 'mongodb://localhost:27017/crm',
};

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const ORDER_STATES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
