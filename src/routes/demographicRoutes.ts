import { FastifyInstance } from 'fastify';
import { ScraperService } from '../services/scraperService';

export async function demographicRoutes(app: FastifyInstance) {
    app.get('/demographics/:zip', async (request, reply) => {
        const { zip } = request.params as { zip: string };
        const data = await ScraperService.getDemographics(zip);

        if (!data || data.median_income === null) {
        return reply.status(404).send({ 
            error: 'No demographic data found for this ZIP code',
            zip: zip 
        });
    }

        return data;
    });
}