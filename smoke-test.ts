import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runSmokeTest() {
    console.log('Starting Marketfully Backend challenge Smoke Test...\n');
    let passed = 0;
    let failed = 0;

    const test = async (name: string, fn: () => Promise<void>) => {
        try {
            process.stdout.write(`Testing ${name}... `);
            await fn();
            console.log('PASS');
            passed++;
        } catch (error: any) {
            console.log('FAIL');
            console.error(`   Error: ${error.message}`);
            failed++;
        }
    };

    // 1. Connectivity & Docs.
    await test('Swagger Documentation reachable', async () => {
        await axios.get(`${BASE_URL}/docs`);
    });

    // 2. Database & Simple Search.
    await test('Basic Property Search (status=for_sale)', async () => {
        const res = await axios.get(`${BASE_URL}/properties?status=for_sale&limit=1`);
        if (!res.data.results) throw new Error('Invalid response structure');
    });

    // 3. Scraper & Cache.
    await test('Demographics Scraper (ZIP 10001)', async () => {
        const res = await axios.get(`${BASE_URL}/demographics/10001`, {
            validateStatus: (status) => (status >= 200 && status < 300) || status === 404
        });

        if (res.status === 404) {
            console.log(' (Note: No data found for this ZIP, but endpoint is live) ');
            return; 
        }

        if (!res.data || res.data.median_income === undefined) {
            throw new Error('Invalid response structure from Scraper');
        }
    });

    // 4. Data Augmentation.
    await test('Property Detail with Zip Augmentation', async () => {
        // Get first ID.
        const list = await axios.get(`${BASE_URL}/properties?status=for_sale&limit=1`);
        const id = list.data.results[0].id;
        const res = await axios.get(`${BASE_URL}/property/${id}?include_zip_info=true`);
        if (!res.data.zip_info) throw new Error('Augmentation failed: zip_info missing');
    });

    console.log('\n------------------------------------------------');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('------------------------------------------------\n');

    process.exit(failed > 0 ? 1 : 0);
}

runSmokeTest();