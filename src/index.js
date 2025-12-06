import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './config/database.js';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers/index.js';
import { extractToken, verifyToken } from './utils/jwt.js';
import { SERVER_CONFIG } from './config/constants.js';

/**
 * 🚀 CRM GraphQL API Server
 * Express 5 + Apollo Server 5 - Modern Stack 2025
 */

// ASCII Art Banner
console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║      🚀  CRM GraphQL API v2.0  🚀                ║
║                                                   ║
║      Clean • Secure • Scalable                   ║
║      Express 5 • Apollo Server 5 • Node 22       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);

/**
 * 🔐 Build GraphQL context with authentication
 */
const buildContext = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  const token = extractToken(authHeader);

  if (!token) {
    return { user: null };
  }

  const user = verifyToken(token);
  return { user };
};

/**
 * 🎨 Custom error formatter
 */
const formatError = (formattedError) => {
  // Log errors in development
  if (SERVER_CONFIG.ENV === 'development') {
    console.error('❌ GraphQL Error:', {
      message: formattedError.message,
      code: formattedError.extensions?.code,
      path: formattedError.path,
    });
  }

  return formattedError };

/**
 * 🏁 Start the server with Express 5
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create Express app
    const app = express();

    // Create HTTP server for graceful shutdown
    const httpServer = http.createServer(app);

    // Create Apollo Server with drain plugin
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      formatError,
      introspection: SERVER_CONFIG.ENV !== 'production',
      includeStacktraceInErrorResponses: SERVER_CONFIG.ENV === 'development',
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // Start Apollo Server
    await server.start();
    console.log('✅ Apollo Server started');

    // Apply middleware
    app.use(
      '/graphql',
      cors({
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
      }),
      express.json({ limit: '10mb' }),
      expressMiddleware(server, {
        context: buildContext,
      })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        node: process.version,
        env: SERVER_CONFIG.ENV,
      });
    });

    // Start HTTP server
    await new Promise((resolve) => {
      httpServer.listen({ port: SERVER_CONFIG.PORT }, resolve);
    });

    console.log(`\n✅ Server ready!`);
    console.log(`📍 URL: http://localhost:${SERVER_CONFIG.PORT}/graphql`);
    console.log(`🔧 Environment: ${SERVER_CONFIG.ENV}`);
    console.log(`🏥 Health: http://localhost:${SERVER_CONFIG.PORT}/health`);
    console.log(`⚡ GraphQL Playground: http://localhost:${SERVER_CONFIG.PORT}/graphql`);
    console.log(`\n👉 Press Ctrl+C to stop\n`);
  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
  process.exit(1);
});
