const http = require('http');

const TEST_HOST = 'localhost';
const TEST_PORT = 3000;

const testCases = [
    {
        name: "Example A",
        data: ["a", "1", "334", "4", "R", "$"],
        expected: {
            odd_numbers: ["1"],
            even_numbers: ["334", "4"],
            alphabets: ["A", "R"],
            special_characters: ["$"],
            sum: "339"
        }
    },
    {
        name: "Example B",
        data: ["2", "a", "y", "4", "&", "-", "*", "5", "92", "b"],
        expected: {
            odd_numbers: ["5"],
            even_numbers: ["2", "4", "92"],
            alphabets: ["A", "Y", "B"],
            special_characters: ["&", "-", "*"],
            sum: "103"
        }
    },
    {
        name: "Example C",
        data: ["A", "ABcD", "DOE"],
        expected: {
            odd_numbers: [],
            even_numbers: [],
            alphabets: ["A", "ABCD", "DOE"],
            special_characters: [],
            sum: "0"
        }
    }
];

function makeRequest(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ data });
        
        const options = {
            hostname: TEST_HOST,
            port: TEST_PORT,
            path: '/bfhl',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseData);
                    resolve({ statusCode: res.statusCode, data: parsedResponse });
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting API tests...\n');
    
    for (const testCase of testCases) {
        console.log(`📋 Testing: ${testCase.name}`);
        console.log(`Input: ${JSON.stringify(testCase.data)}`);
        
        try {
            const response = await makeRequest(testCase.data);
            
            if (response.statusCode === 200 && response.data.is_success) {
                console.log('✅ Status: SUCCESS');
                console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
                
                const result = response.data;
                console.log(`User ID: ${result.user_id}`);
                console.log(`Email: ${result.email}`);
                console.log(`Roll Number: ${result.roll_number}`);
                console.log(`Sum: ${result.sum}`);
                console.log(`Concat String: ${result.concat_string}`);
                
            } else {
                console.log('❌ Status: FAILED');
                console.log(`Status Code: ${response.statusCode}`);
                console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
            }
            
        } catch (error) {
            console.log('❌ Status: ERROR');
            console.log(`Error: ${error.message}`);
        }
        
        console.log('─'.repeat(50) + '\n');
    }
    
    console.log('🏁 Tests completed!');
}

function checkServerHealth() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: TEST_HOST,
            port: TEST_PORT,
            path: '/',
            method: 'GET'
        }, (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.end();
    });
}

async function main() {
    console.log('🔍 Checking if server is running...');
    
    const isServerRunning = await checkServerHealth();
    
    if (!isServerRunning) {
        console.log('❌ Server is not running. Please start the server first with:');
        console.log('   node server.js');
        console.log('\nThen run this test file with:');
        console.log('   node test.js');
        return;
    }
    
    console.log('✅ Server is running. Starting tests...\n');
    await runTests();
}

if (require.main === module) {
    main().catch(console.error);
} 