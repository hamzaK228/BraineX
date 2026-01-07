const store = require('./backend/services/inMemoryStore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Env
process.env.JWT_SECRET = 'dev-secret-key-change-in-production';

async function runTests() {
    console.log('🧪 Starting Reproduction Tests...');

    // 1. Test Auth Security
    console.log('\n🔒 Testing Auth Security...');
    const adminUser = store.findOne('users', { email: 'admin@brainex.com' });

    if (!adminUser) {
        console.error('❌ Admin user not found in store!');
        return;
    }

    console.log('Admin user found:', adminUser.email);

    // Test wrong password
    const isMatchWrong = await bcrypt.compare('wrongpassword', adminUser.password);
    console.log(`Password check 'wrongpassword': ${isMatchWrong ? '✅ MATCH (FAIL)' : '❌ NO MATCH (PASS)'}`);

    if (isMatchWrong) {
        console.error('🚨 SECURITY CRITICAL: Wrong password was accepted!');
    }

    // Test correct password
    const isMatchCorrect = await bcrypt.compare('admin123', adminUser.password);
    console.log(`Password check 'admin123': ${isMatchCorrect ? '✅ MATCH (PASS)' : '❌ NO MATCH (FAIL)'}`);

    // 2. Test Admin Functionality (Scholarship Creation)
    console.log('\n📚 Testing Admin Functionality...');

    // Simulate Route Handler Logic for Scholarship Creation
    try {
        const newScholarship = {
            name: "Test Scholarship",
            organization: "Test Org",
            amount: "1000",
            category: "undergraduate",
            deadline: "2025-01-01",
            status: "active"
        };

        // Direct store access (simulating controller)
        const createdItem = store.create('scholarships', newScholarship);

        if (createdItem && createdItem._id) {
            console.log('✅ Scholarship created successfully in store:', createdItem.name);
        } else {
            console.error('❌ Failed to create scholarship in store');
        }

        const count = store.count('scholarships');
        console.log(`Total scholarships in store: ${count}`);

    } catch (err) {
        console.error('❌ Error testing admin function:', err);
    }

    console.log('\n🏁 Tests Completed');
}

runTests();
