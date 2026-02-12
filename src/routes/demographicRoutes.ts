import { FastifyInstance } from 'fastify';
import { ScraperService } from '../services/scraperService';

export async function demographicRoutes(app: FastifyInstance) {
    app.get('/demographics/:zip', async (request, reply) => {
        const { zip } = request.params as { zip: string };
        const data = await ScraperService.getDemographics(zip);
        return data || reply.status(404).send({ error: 'Not found' });
    });
}