
const http = require('http');

const API_URL = 'http://localhost:3000/api/users?t=';
const ITERATIONS = 100; // Number of requests to fire
const CONCURRENCY = 10;  // Simultaneous requests

console.log(`Starting stress test: ${ITERATIONS} requests to ${API_URL}...`);

let successCount = 0;
let errorCount = 0;
let completed = 0;

function makeRequest(index) {
    return new Promise((resolve) => {
        http.get(API_URL + Date.now() + '_' + index, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    successCount++;
                    // process.stdout.write('.');
                } else {
                    errorCount++;
                    console.log(`\n[FAIL] Request ${index} failed with Status ${res.statusCode}`);
                    try {
                        const json = JSON.parse(data);
                        console.log('Error Details:', JSON.stringify(json, null, 2));
                    } catch (e) {
                        console.log('Raw Body:', data.substring(0, 200));
                    }
                }
                resolve();
            });
        }).on('error', (err) => {
            errorCount++;
            console.log(`\n[NET ERROR] Request ${index} failed: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    const batchSize = CONCURRENCY;
    for (let i = 0; i < ITERATIONS; i += batchSize) {
        const promises = [];
        for (let j = 0; j < batchSize && i + j < ITERATIONS; j++) {
            promises.push(makeRequest(i + j));
        }
        await Promise.all(promises);
        process.stdout.write(`Batch ${Math.min(i + batchSize, ITERATIONS)}/${ITERATIONS} done... `);
    }

    console.log('\n--- Test Complete ---');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount > 0) {
        console.log('FAILURE REPRODUCED: API is returning errors.');
        process.exit(1);
    } else {
        console.log('No errors captured. API seems stable under this load.');
        process.exit(0);
    }
}

run();
