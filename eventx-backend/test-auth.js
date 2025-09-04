// Simple test script for authentication endpoints
// Run with: node test-auth.js

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    const token = registerResponse.data.token;
    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Test 2: Login with the same user
    console.log('\n2. Testing User Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.message);

    // Test 3: Get user profile (authenticated)
    console.log('\n3. Testing Protected Route...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful:', profileResponse.data.name);

    // Test 4: Test invalid token
    console.log('\n4. Testing Invalid Token...');
    try {
      await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
    } catch (error) {
      console.log('✅ Invalid token properly rejected:', error.response.status);
    }

    console.log('\n🎉 All authentication tests passed!');
    console.log('\nFrontend can now integrate with these endpoints.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    console.log('\nMake sure:');
    console.log('- MongoDB is running');
    console.log('- Server is started (npm start)');
    console.log('- .env file is configured');
  }
}

testAuth();
