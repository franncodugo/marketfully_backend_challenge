import { FastifyInstance } from 'fastify';
import { ScraperService } from '../services/scraperService';
import db from '../db';
import { PropertyFilters } from '../types';

export async function propertyRoutes(app: FastifyInstance) {
    
    // GET /properties
    app.get('/properties', {
        schema: {
            description: 'Search properties with database filters and demographic data',
            querystring: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['for_sale', 'sold', 'ready_to_build'] },
                    state_code: { type: 'string' },
                    min_price: { type: 'number' },
                    max_price: { type: 'number' },
                    min_bed: { type: 'number' },
                    max_bed: { type: 'number' },
                    min_bath: { type: 'number' },
                    max_bath: { type: 'number' },
                    min_acre_lot: { type: 'number' },
                    max_acre_lot: { type: 'number' },
                    min_house_size: { type: 'number' },
                    max_house_size: { type: 'number' },
                    min_population: { type: 'number' },
                    max_population: { type: 'number' },
                    min_median_income: { type: 'number' },
                    max_median_income: { type: 'number' },
                    min_median_age: { type: 'number' },
                    max_median_age: { type: 'number' },
                    page: { type: 'number', default: 1 },
                    limit: { type: 'number', default: 20 }
                }
            }
        }
    }, async (request, reply) => {
        const query = request.query as PropertyFilters;
        
        if (!query.status) {
            return reply.status(400).send({ error: "Status is required" });
        }

        let whereClauses = ["status = ?"];
        let params: any[] = [query.status];

        // Demographic logic.
        if (shouldApplyDemographics(query)) {
            const matchedZips = await getMatchedDemographicZips(query);
            
            if (matchedZips.length > 0) {
                const placeholders = matchedZips.map(() => '?').join(',');
                whereClauses.push(`zip_code IN (${placeholders})`);
                params.push(...matchedZips);
            } else {
                return { info: { total: 0, page: 1, limit: 20, pages: 0 }, results: [] };
            }
        }

        // rest of the filters.
        applyRangeFilters(query, whereClauses, params);

        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Number(query.limit) || 20);
        const offset = (page - 1) * limit;

        const sql = `SELECT * FROM properties WHERE ${whereClauses.join(' AND ')} LIMIT ${limit} OFFSET ${offset}`;
        const results = db.prepare(sql).all(...params);

        return { results };
    });

    // GET /property/:id
    app.get('/property/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string' } }
            },
            querystring: {
                type: 'object',
                properties: { include_zip_info: { type: 'string', enum: ['true', 'false'] } }
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { include_zip_info } = request.query as { include_zip_info?: string };

        const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as any;
        if (!property) return reply.status(404).send({ error: "Not found" });

        if (include_zip_info === 'true') {
            property.zip_info = await ScraperService.getDemographics(property.zip_code);
        }
        return property;
    });
}

/**
 * Helper functions for demographic filtering logic.
 */
function shouldApplyDemographics(query: PropertyFilters): boolean {
    const hasDemographicParams = query.min_population || query.max_population || 
                                 query.min_median_income || query.max_median_income ||
                                 query.min_median_age || query.max_median_age;
    return !!(hasDemographicParams && query.state_code);
}

async function getMatchedDemographicZips(query: PropertyFilters): Promise<string[]> {
    const excludedTerritories = ['AS', 'GU', 'MP', 'PR', 'VI'];
    if (excludedTerritories.includes(query.state_code!.toUpperCase())) {
        return [];
    }

    const filters = [
        `MedianIncome-${query.min_median_income || 0}-${query.max_median_income || 999999}`,
        `Population-${query.min_population || 0}-${query.max_population || 9999999}`,
        `MedianAge-${query.min_median_age || 0}-${query.max_median_age || 99}`
    ].join('_');

    return await ScraperService.searchZipsByAttributes(filters, query.state_code!);
}

function applyRangeFilters(query: PropertyFilters, whereClauses: string[], params: any[]) {
    const addRange = (field: string, min?: number, max?: number) => {
        if (min !== undefined) { whereClauses.push(`${field} >= ?`); params.push(min); }
        if (max !== undefined) { whereClauses.push(`${field} <= ?`); params.push(max); }
    };

    addRange('price', query.min_price, query.max_price);
    addRange('bed', query.min_bed, query.max_bed);
    addRange('bath', query.min_bath, query.max_bath);
    addRange('acre_lot', query.min_acre_lot, query.max_acre_lot);
    addRange('house_size', query.min_house_size, query.max_house_size);
}