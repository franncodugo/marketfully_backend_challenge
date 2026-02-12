import { initDb } from './db';
import { ingestData } from './services/ingestionService';

async function main() {
    try {
        console.log('Initializing');
        initDb();
        await ingestData();
        console.log('Process completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();