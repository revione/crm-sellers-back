import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createToken } from '../utils/jwt.js';
import { createError, validatePassword } from '../utils/validators.js';
import { BCRYPT_CONFIG, ERROR_CODES } from '../config/constants.js';

class UserService {
  /**
   * 👤 Creates a new user with hashed password
   * @param {Object} input - User input data
   * @returns {Promise<Object>} Created user
   */
  async createUser(input) {
    const { email, password } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw createError('A user with this email already exists', ERROR_CODES.BAD_USER_INPUT);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw createError(
        `Weak password: ${passwordValidation.errors.join(', ')}`,
        ERROR_CODES.BAD_USER_INPUT
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_CONFIG.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      ...input,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    console.log(`✅ New user created: ${user.email}`);
    return user;
  }

  /**
   * 🔑 Authenticates user and returns JWT token
   * @param {Object} input - Login credentials
   * @returns {Promise<Object>} Token object
   */
  async authenticateUser(input) {
    const { email, password } = input;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw createError('Invalid email or password', ERROR_CODES.UNAUTHENTICATED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', ERROR_CODES.UNAUTHENTICATED);
    }

    // Generate token
    const token = createToken(user);

    console.log(`✅ User authenticated: ${user.email}`);

    return { token };
  }

  /**
   * 👁️ Gets user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(id) {
    const user = await User.findById(id);

    if (!user) {
      throw createError('User not found', ERROR_CODES.NOT_FOUND);
    }

    return user;
  }

  /**
   * 📝 Updates user information
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updates) {
    // Don't allow password update through this method
    delete updates.password;
    delete updates.email; // Email changes require re-verification

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw createError('User not found', ERROR_CODES.NOT_FOUND);
    }

    console.log(`✅ User updated: ${user.email}`);
    return user;
  }
}

export default new UserService();
