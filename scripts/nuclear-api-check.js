
const http = require('http');

const endpoints = [
    '/api/ping',
    '/api/branding',
    '/api/drips',
    '/api/flows',
    '/api/templates',
    '/api/goals',
    '/api/diagnostic/waba',
    '/api/diagnostic/fs'
];

async function testEndpoint(path) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
            console.log(`[TEST] ${path} -> Status: ${res.statusCode}`);
            resolve(res.statusCode);
        });
        req.on('error', (e) => {
            console.log(`[TEST] ${path} -> ERROR: ${e.message}`);
            resolve(500);
        });
        req.setTimeout(5000, () => {
            console.log(`[TEST] ${path} -> TIMEOUT`);
            req.destroy();
            resolve(504);
        });
    });
}

async function runAllTests() {
    console.log("--- NUCLEAR API HEALTH CHECK ---");
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
    console.log("--- CHECK COMPLETE ---");
}

runAllTests();
