const http = require('http');
const url = require('url');

const USER_INFO = {
    fullName: "john_doe",
    email: "john@xyz.com",
    rollNumber: "ABCD123"
};

function isNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

function isAlphabet(str) {
    return /^[a-zA-Z]+$/.test(str);
}

function isSpecialChar(str) {
    return str.length === 1 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
}

function generateUserId(fullName) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${fullName.toLowerCase()}_${day}${month}${year}`;
}

function processData(data) {
    try {
        const evenNumbers = [];
        const oddNumbers = [];
        const alphabets = [];
        const specialCharacters = [];
        let sum = 0;
        const allAlphabets = [];

        data.forEach(item => {
            if (isNumber(item)) {
                const num = parseInt(item);
                if (num % 2 === 0) {
                    evenNumbers.push(String(num));
                } else {
                    oddNumbers.push(String(num));
                }
                sum += num;
            } else if (isAlphabet(item)) {
                const upperItem = item.toUpperCase();
                alphabets.push(upperItem);
                allAlphabets.push(...item.split(''));
            } else if (isSpecialChar(item)) {
                specialCharacters.push(item);
            }
        });

        let concatString = '';
        for (let i = allAlphabets.length - 1; i >= 0; i--) {
            const char = allAlphabets[i];
            const position = allAlphabets.length - 1 - i;
            const shouldUpperCase = position % 2 === 0;
            if (shouldUpperCase) {
                concatString += char.toUpperCase();
            } else {
                concatString += char.toLowerCase();
            }
        }

        return {
            is_success: true,
            user_id: generateUserId(USER_INFO.fullName),
            email: USER_INFO.email,
            roll_number: USER_INFO.rollNumber,
            odd_numbers: oddNumbers,
            even_numbers: evenNumbers,
            alphabets: alphabets,
            special_characters: specialCharacters,
            sum: String(sum),
            concat_string: concatString
        };
    } catch (error) {
        return {
            is_success: false,
            error: "Error processing data",
            message: error.message
        };
    }
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const path = req.url;

    if (path === '/bfhl' && req.method === 'POST') {
        try {
            const requestData = req.body;
            
            if (!requestData.data || !Array.isArray(requestData.data)) {
                res.status(400).json({
                    is_success: false,
                    error: "Invalid input. 'data' field must be an array."
                });
                return;
            }

            const result = processData(requestData.data);
            res.status(200).json(result);
            
        } catch (error) {
            res.status(400).json({
                is_success: false,
                error: "Invalid JSON format",
                message: error.message
            });
        }
    } else if (path === '/' && req.method === 'GET') {
        res.status(200).json({
            message: "BFHL API is running",
            endpoint: "/bfhl",
            method: "POST",
            status: "active"
        });
    } else {
        res.status(404).json({
            is_success: false,
            error: "Route not found",
            available_routes: ["/", "/bfhl"]
        });
    }
}; 