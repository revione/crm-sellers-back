import { GraphQLError } from 'graphql';
import { ERROR_CODES } from '../config/constants.js';

/**
 * 📧 Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 🔒 Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 📱 Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * 💰 Validates price/amount
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if valid
 */
export const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0 && !isNaN(amount);
};

/**
 * 📦 Validates stock quantity
 * @param {number} quantity - Quantity to validate
 * @returns {boolean} True if valid
 */
export const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0;
};

/**
 * 🆔 Validates MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * ⚠️ Creates a standardized GraphQL error
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {GraphQLError} Formatted error
 */
export const createError = (message, code = ERROR_CODES.BAD_USER_INPUT) => {
  return new GraphQLError(message, {
    extensions: { code },
  });
};
