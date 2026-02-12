import fastify from 'fastify';
import cors from '@fastify/cors';
import { propertyRoutes } from './routes/propertyRoutes';
import { demographicRoutes } from './routes/demographicRoutes';

const app = fastify({ logger: true });

app.register(cors);

// Routes registration.
app.register(propertyRoutes);
app.register(demographicRoutes);

export default app;