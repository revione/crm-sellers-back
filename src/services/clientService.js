import Client from '../models/Client.js';
import { createError } from '../utils/validators.js';
import { requireAuth, requireOwnership } from '../middleware/auth.js';
import { ERROR_CODES } from '../config/constants.js';

class ClientService {
  /**
   * 🏢 Gets all clients
   * @returns {Promise<Array>} List of clients
   */
  async getAllClients() {
    return await Client.find({ active: true })
      .populate('seller', 'name lastname email')
      .sort({ created: -1 });
  }

  /**
   * 👤 Gets clients for a specific seller
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Array>} Seller's clients
   */
  async getClientsBySeller(sellerId) {
    return await Client.find({ seller: sellerId, active: true }).sort({ created: -1 });
  }

  /**
   * 🔍 Gets client by ID
   * @param {string} id - Client ID
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Client object
   */
  async getClientById(id, context) {
    const client = await Client.findById(id).populate('seller', 'name lastname email');

    if (!client) {
      throw createError('Client not found', ERROR_CODES.NOT_FOUND);
    }

    // Verify ownership
    requireOwnership(client.seller._id || client.seller, context);

    return client;
  }

  /**
   * ➕ Creates a new client
   * @param {Object} input - Client data
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Created client
   */
  async createClient(input, context) {
    requireAuth(context);

    const { email } = input;

    // Check if client already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      throw createError('A client with this email already exists', ERROR_CODES.BAD_USER_INPUT);
    }

    // Create client assigned to current seller
    const client = new Client({
      ...input,
      email: email.toLowerCase(),
      seller: context.user.id,
    });

    await client.save();

    console.log(`✅ Client created: ${client.company} (${client.email})`);
    return client;
  }

  /**
   * ✏️ Updates a client
   * @param {string} id - Client ID
   * @param {Object} input - Update data
   * @param {Object} context - GraphQL context
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(id, input, context) {
    const client = await Client.findById(id);

    if (!client) {
      throw createError('Client not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(client.seller, context);

    // Don't allow changing seller
    delete input.seller;

    Object.assign(client, input);
    await client.save();

    console.log(`✅ Client updated: ${client.company}`);
    return client;
  }

  /**
   * 🗑️ Deletes a client (soft delete)
   * @param {string} id - Client ID
   * @param {Object} context - GraphQL context
   * @returns {Promise<string>} Success message
   */
  async deleteClient(id, context) {
    const client = await Client.findById(id);

    if (!client) {
      throw createError('Client not found', ERROR_CODES.NOT_FOUND);
    }

    requireOwnership(client.seller, context);

    client.active = false;
    await client.save();

    console.log(`✅ Client deleted: ${client.company}`);
    return 'Client deleted successfully';
  }
}

export default new ClientService();
