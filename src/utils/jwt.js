import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants.js';

/**
 * 🔑 Creates a JWT token for a user
 * @param {Object} user - User object from database
 * @returns {string} Signed JWT token
 */
export const createToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    lastname: user.lastname,
  };

  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
  });
};

/**
 * 🔍 Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded user payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET);
  } catch (error) {
    console.error('⚠️  Token verification failed:', error.message);
    return null;
  }
};

/**
 * 📤 Extracts token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export const extractToken = (authHeader) => {
  if (!authHeader) return null;

  // Support both "Bearer token" and just "token" formats
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token || null;
};

/**
 * 🕐 Checks if token is expired
 * @param {Object} decodedToken - Decoded JWT payload
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) return true;
  return Date.now() >= decodedToken.exp * 1000;
};
