import axios from 'axios';
import csv from 'csv-parser';
import db from '../db';
import { stateMap } from '../utils/stateMap';

const CSV_URL = 'https://getgloby-realtor-challenge.s3.us-east-1.amazonaws.com/realtor-data.csv';

export const ingestData = async () => {
    console.log('Initiating data ingestion process.');
    
    // Cleaning.
    db.prepare('DELETE FROM properties').run();

    // Preparing statement for batch insertion.
    const insertStmt = db.prepare(`
        INSERT INTO properties (
            status, price, bed, bath, acre_lot, full_address, street, city, state, zip_code, house_size, sold_date, 
            state_code, price_per_sq_ft, price_per_acre
        ) VALUES (
            @status, @price, @bed, @bath, @acre_lot, @full_address, @street, @city, @state, @zip_code, @house_size, @sold_date, 
            @state_code, @price_per_sq_ft, @price_per_acre
        )
    `);

    // Get stream from response.
    const response = await axios({ method: 'get', url: CSV_URL, responseType: 'stream' });

    let rowsBatch: any[] = [];
    const BATCH_SIZE = 1000;
    let count = 0;

    // Transaction.
    const insertMany = db.transaction((rows) => {
        for (const row of rows) insertStmt.run(row);
    });

    return new Promise((resolve, reject) => {
        response.data
            .pipe(csv())
            .on('data', (data: any) => {
                const price = parseFloat(data.price) || 0;
                const houseSize = parseFloat(data.house_size) || 0;
                const acreLot = parseFloat(data.acre_lot) || 0;
                const stateName = data.state;

                const row = {
                    status: data.status,
                    price: price,
                    bed: parseInt(data.bed) || null,
                    bath: parseInt(data.bath) || null,
                    acre_lot: acreLot,
                    full_address: data.full_address,
                    street: data.street,
                    city: data.city,
                    state: stateName,
                    zip_code: data.zip_code?.padStart(5, '0'), // normalize
                    house_size: houseSize,
                    sold_date: data.sold_date,
                    state_code: stateMap[stateName] || null,
                    price_per_sq_ft: (price > 0 && houseSize > 0) ? (price / houseSize) : null,
                    price_per_acre: (price > 0 && acreLot > 0) ? (price / acreLot) : null
                };

                rowsBatch.push(row);

                if (rowsBatch.length >= BATCH_SIZE) {
                    insertMany(rowsBatch);
                    count += rowsBatch.length;
                    console.log(`... processing ${count} rows`);
                    rowsBatch = [];
                }
            })
            .on('end', () => {
                if (rowsBatch.length > 0) insertMany(rowsBatch);
                console.log('Completed succesfully.');
                resolve(true);
            })
            .on('error', (err: any) => {
                console.error('Streaming error:', err);
                reject(err);
            });
    });
};