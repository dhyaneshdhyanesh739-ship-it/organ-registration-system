const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

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
        console.log('Expected Error (since token is mock):', error.response?.data?.message || error.message);
        if (error.response?.data?.message === 'Google ID Token is required' || error.message.includes('400')) {
             console.log('✅ Route and controller are reachable.');
        } else {
             console.log('❌ Unexpected error:', error.message);
        }
    }
}

testGoogleLogin();
