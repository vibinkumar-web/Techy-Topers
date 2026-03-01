const fs = require('fs');
const http = require('http');

const API_DIR = 'c:/Users/LENOVO/Desktop/Taxi-new-ui/backend/api/';
const BASE_URL = 'http://localhost:8080/backend/api/';

const files = fs.readdirSync(API_DIR).filter(f => f.endsWith('.php'));

async function checkEndpoint(file) {
    return new Promise((resolve) => {
        const req = http.get(BASE_URL + file, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let status = 'OK';
                if (res.statusCode >= 500 || data.includes('SQLSTATE') || data.includes('Fatal error') || data.includes('Warning:')) {
                    status = 'FAIL';
                } else if (res.statusCode === 400) {
                    status = 'WARN_400';
                }
                resolve({ file, statusCode: res.statusCode, status, data: data.substring(0, 150) });
            });
        });
        req.on('error', (e) => {
            resolve({ file, statusCode: 'ERR', status: 'FAIL', data: e.message });
        });
    });
}

async function run() {
    let fails = 0;
    for (const file of files) {
        const res = await checkEndpoint(file);
        if (res.status === 'FAIL') {
            fails++;
            console.log(`\n❌ [${file}] - Status: ${res.statusCode}`);
            console.log(`   Response: ${res.data}`);
        } else if (res.statusCode === 200) {
            console.log(`✅ [${file}] OK`);
        }
    }
    console.log(`\nScan complete. ${fails} failed endpoints found.`);
}

run();
