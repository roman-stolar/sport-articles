import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { SportsArticle } from './entities/SportsArticle';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async () => ({
        dataSource: AppDataSource,
        articleRepository: AppDataSource.getRepository(SportsArticle),
      }),
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);

  process.on('SIGTERM', async () => {
    await AppDataSource.destroy();
    httpServer.close();
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

