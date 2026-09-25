const axios = require('axios');

require('dotenv').config();
const PORT = process.env.PORT || 5001;
const API_URL = `http://localhost:${PORT}/api/auth`;

async function testGoogleLogin() {
    console.log('--- Testing Google Login (Server-side) ---');
    try {
        // This will fail without a real token, but we want to see it hit the controller
        const response = await axios.post(`${API_URL}/google-login`, {
            idToken: 'mock_token',
            role: 'donor'
        });
        console.log('Response:', response.data);
    } catch (error) {
        const errorMsg = error.response?.data?.message || '';
        console.log('Expected Error (since token is mock):', errorMsg || error.message);
        if (
            errorMsg === 'Google ID Token is required' || 
            error.message.includes('400') ||
            errorMsg.includes('Wrong number of segments in token')
        ) {
             console.log('✅ Route and controller are reachable.');
        } else {
             console.log('❌ Unexpected error:', error.message);
        }
    }
}

testGoogleLogin();
