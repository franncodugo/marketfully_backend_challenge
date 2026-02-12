import axios from 'axios';
import * as cheerio from 'cheerio';
import db from '../db';

import { ZipDemographics } from '../types';

export class ScraperService {
    private static readonly BASE_URL = 'https://zipwho.com';

    /**
     * Implements a "Cache-Aside" pattern. Only scrapes if the data does not exist in SQLite.
     * This reduces network traffic and response times for repeated requests.
     * @param zip 
     * @returns 
     */
    static async getDemographics(zip: string): Promise<ZipDemographics | null> {
        // 1. Query and cache table verification.
        const cached = db.prepare('SELECT data FROM zip_cache WHERE zip_code = ?').get(zip) as any;
        if (cached) {
            return JSON.parse(cached.data);
        }

        // 2. If not cached, proceed to scrape.
        try {
            const response = await axios.get(`${this.BASE_URL}/?zip=${zip}&mode=zip`, { 
                // timeout after 5 seconds
                timeout: 5000, 
                headers: { 'User-Agent': 'MarketfullyBot/1.0' } 
            });

            const $ = cheerio.load(response.data);
            
            // Extract relevant data points
            const median_income = this.parseValue($('td:contains("Median Income")').next().text());
            const population = this.parseValue($('td:contains("Population")').next().text());
            const median_age = this.parseValue($('td:contains("Median Age")').next().text());

            const result: ZipDemographics = {
                zip_code: zip,
                median_income,
                population,
                median_age
            };

            // 3. Adding the result to cache table.
            db.prepare('INSERT OR REPLACE INTO zip_cache (zip_code, data) VALUES (?, ?)')
              .run(zip, JSON.stringify(result));

            return result;
        } catch (error) {
            console.error(`Scraping error for ZIP ${zip}:`, error);
            return null;
        }
    }

    /**
     * Filter ZIPs directly from HTML to avoid bringing extra data into the main process.
     * @param filters 
     * @param stateCode 
     * @returns 
     */
    static async searchZipsByAttributes(filters: string, stateCode: string): Promise<string[]> {
        const url = `${this.BASE_URL}/?mode=demo&filters=${filters}&state=${stateCode}`;
        
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);
            const zips: string[] = [];

            // Parsing first column of the table for ZIP codes.
            $('table tr td:first-child').each((_, el) => {
                const text = $(el).text().trim();
                if (/^\d{5}$/.test(text)) zips.push(text);
            });

            return zips;
        } catch (error) {
            return [];
        }
    }

    private static parseValue(text: string): number | null {
        const clean = text.replace(/[^0-9.]/g, '');
        return clean ? parseFloat(clean) : null;
    }
}