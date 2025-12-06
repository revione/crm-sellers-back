const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
require('dotenv').config({ path: '.env' });

const buildContext = ({ req }) => {
  const token = req.headers.authorization || '';
  if (!token) return {};

  try {
    const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
    return { user };
  } catch (err) {
    console.log('There was an error while verifying token: ', err);
    return {};
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const startServer = async () => {
  await conectarDB();

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT, 10) || 4000 },
    context: async ({ req }) => buildContext({ req })
  });

  console.log(`Server running in URL ${url}`);
};

startServer();
