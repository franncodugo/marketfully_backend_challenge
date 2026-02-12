import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { propertyRoutes } from './routes/propertyRoutes';
import { demographicRoutes } from './routes/demographicRoutes';

const app = fastify({ 
    logger: true,
    bodyLimit: 1048576 
});

app.register(swagger, {
    swagger: {
        info: {
            title: 'Marketfully Challenge API',
            description: 'Houses search API with integrated ZipWho scraper',
            version: '1.0.0'
        },
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
});

app.register(swaggerUi, {
    // http://localhost:3000/docs
    routePrefix: '/docs', 
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    }
});


app.register(cors);

// Routes registration.
app.register(propertyRoutes);
app.register(demographicRoutes);

export default app;