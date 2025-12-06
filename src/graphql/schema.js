import { gql } from 'graphql-tag';

/**
 * 🎨 GraphQL Schema Definition
 * Clean, well-documented, and type-safe
 */

export const typeDefs = gql`
  # ========================================
  # 👤 USER TYPES
  # ========================================

  """
  Represents a seller/admin user in the system
  """
  type User {
    id: ID!
    name: String!
    lastname: String!
    email: String!
    fullName: String
    created: String!
  }

  """
  JWT authentication token
  """
  type Token {
    token: String!
  }

  # ========================================
  # 📦 PRODUCT TYPES
  # ========================================

  """
  Product in the catalog
  """
  type Product {
    id: ID!
    name: String!
    existence: Int!
    price: Float!
    description: String
    category: String
    inStock: Boolean
    stockStatus: String
    active: Boolean!
    created: String!
  }

  # ========================================
  # 🏢 CLIENT TYPES
  # ========================================

  """
  Client/Customer in the CRM
  """
  type Client {
    id: ID!
    name: String!
    lastname: String!
    company: String!
    email: String!
    tel: String
    fullName: String
    seller: ID!
    active: Boolean!
    created: String!
  }

  # ========================================
  # 📋 ORDER TYPES
  # ========================================

  """
  Individual item in an order
  """
  type OrderGroup {
    product: ID!
    quantity: Int!
    name: String!
    price: Float!
  }

  """
  Customer order
  """
  type Order {
    id: ID!
    order: [OrderGroup!]!
    total: Float!
    client: Client!
    seller: ID!
    state: StateOrder!
    notes: String
    date: String!
    itemCount: Int
    statusDisplay: String
  }

  """
  Order state enumeration
  """
  enum StateOrder {
    PENDING
    COMPLETED
    CANCELLED
  }

  # ========================================
  # 📊 ANALYTICS TYPES
  # ========================================

  """
  Top performing client
  """
  type TopClient {
    total: Float!
    client: [Client!]!
  }

  """
  Top performing seller
  """
  type TopSeller {
    total: Float!
    seller: [User!]!
  }

  # ========================================
  # 📥 INPUT TYPES
  # ========================================

  """
  Input for creating a new user
  """
  input UserInput {
    name: String!
    lastname: String!
    email: String!
    password: String!
  }

  """
  Input for user authentication
  """
  input AuthenticateInput {
    email: String!
    password: String!
  }

  """
  Input for creating/updating a product
  """
  input ProductInput {
    name: String!
    existence: Int!
    price: Float!
    description: String
    category: String
  }

  """
  Input for creating/updating a client
  """
  input ClientInput {
    name: String!
    lastname: String!
    company: String!
    email: String!
    tel: String
    notes: String
  }

  """
  Input for order items
  """
  input OrderProductInput {
    id: ID!
    quantity: Int!
    name: String!
    price: Float!
  }

  """
  Input for creating/updating an order
  """
  input OrderInput {
    order: [OrderProductInput!]!
    total: Float!
    client: ID!
    state: StateOrder
    notes: String
  }

  # ========================================
  # 🔍 QUERIES
  # ========================================

  type Query {
    # ====== Users ======
    """
    Get current authenticated user
    """
    getUser: User

    # ====== Products ======
    """
    Get all products
    """
    getProducts: [Product!]!

    """
    Get a single product by ID
    """
    getProduct(id: ID!): Product

    """
    Search products by text
    """
    searchProducts(text: String!): [Product!]!

    # ====== Clients ======
    """
    Get all clients (admin only)
    """
    getClients: [Client!]!

    """
    Get clients assigned to current seller (requires auth)
    """
    getClientsSeller: [Client!]!

    """
    Get a single client by ID (requires auth & ownership)
    """
    getClient(id: ID!): Client

    # ====== Orders ======
    """
    Get all orders (admin only)
    """
    getOrders: [Order!]!

    """
    Get orders for current seller (requires auth)
    """
    getOrdersSeller: [Order!]!

    """
    Get a single order by ID (requires auth & ownership)
    """
    getOrder(id: ID!): Order

    """
    Get orders by state for current seller (requires auth)
    """
    getOrdersState(state: String!): [Order!]!

    # ====== Analytics ======
    """
    Get top 10 clients by total completed sales
    """
    bestClients: [TopClient!]!

    """
    Get top 3 sellers by total completed sales
    """
    bestSellers: [TopSeller!]!
  }

  # ========================================
  # ✏️ MUTATIONS
  # ========================================

  type Mutation {
    # ====== Users ======
    """
    Register a new user
    """
    createUser(input: UserInput!): User!

    """
    Authenticate and get JWT token
    """
    authenticateUser(input: AuthenticateInput!): Token!

    # ====== Products ======
    """
    Create a new product
    """
    createProduct(input: ProductInput!): Product!

    """
    Update an existing product
    """
    updateProduct(id: ID!, input: ProductInput!): Product!

    """
    Delete a product (soft delete)
    """
    deleteProduct(id: ID!): String!

    # ====== Clients ======
    """
    Create a new client (requires auth)
    """
    createClient(input: ClientInput!): Client!

    """
    Update a client (requires auth & ownership)
    """
    updateClient(id: ID!, input: ClientInput!): Client!

    """
    Delete a client (requires auth & ownership)
    """
    deleteClient(id: ID!): String!

    # ====== Orders ======
    """
    Create a new order (requires auth, validates stock)
    """
    createOrder(input: OrderInput!): Order!

    """
    Update an order (requires auth & ownership)
    """
    updateOrder(id: ID!, input: OrderInput!): Order!

    """
    Delete an order (requires auth & ownership, restores stock if pending)
    """
    deleteOrder(id: ID!): String!
  }
`;
