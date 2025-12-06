import clientService from '../../services/clientService.js';
import { getCurrentUser } from '../../middleware/auth.js';

export const clientResolvers = {
  Query: {
    /**
     * 🏢 Get all clients
     */
    getClients: () => clientService.getAllClients(),

    /**
     * 👤 Get clients for current seller
     */
    getClientsSeller: (_, __, context) => {
      const user = getCurrentUser(context);
      return clientService.getClientsBySeller(user.id);
    },

    /**
     * 🔍 Get single client by ID
     */
    getClient: (_, { id }, context) => clientService.getClientById(id, context),
  },

  Mutation: {
    /**
     * ➕ Create new client
     */
    createClient: (_, { input }, context) => clientService.createClient(input, context),

    /**
     * ✏️ Update client
     */
    updateClient: (_, { id, input }, context) =>
      clientService.updateClient(id, input, context),

    /**
     * 🗑️ Delete client
     */
    deleteClient: (_, { id }, context) => clientService.deleteClient(id, context),
  },
};
