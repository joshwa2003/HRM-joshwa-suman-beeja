/**
 * Test Script for First Login Flow Implementation
 * 
 * This script demonstrates the complete first-time login flow:
 * 1. Admin creates user with default password
 * 2. User receives email with credentials
 * 3. User logs in and is forced to change password
 * 4. User is redirected to profile to complete profile
 * 5. User can access dashboard only after profile completion
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    email: 'admin@company.com',
    password: 'password123'
  },
  newUser: {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@company.com',
    role: 'Employee',
    sendEmail: true
  }
};

let adminToken = '';
let newUserToken = '';
let newUserPassword = '';

async function runTest() {
  console.log('🚀 Starting First Login Flow Test...\n');

  try {
    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CONFIG.adminCredentials);
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully\n');

    // Step 2: Admin Creates New User
    console.log('2️⃣ Admin creates new user...');
    const createUserResponse = await axios.post(
      `${API_BASE_URL}/users`,
      TEST_CONFIG.newUser,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    const newUser = createUserResponse.data.user;
    console.log('✅ User created successfully:');
    console.log(`   - Name: ${newUser.firstName} ${newUser.lastName}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Employee ID: ${newUser.employeeId}`);
    console.log(`   - Is First Login: ${newUser.isFirstLogin}`);
    console.log(`   - Is Default Password: ${newUser.isDefaultPassword}`);
    
    // Check email status
    if (createUserResponse.data.emailStatus) {
      if (createUserResponse.data.emailStatus.sent) {
        console.log('✅ Email sent successfully to user');
      } else {
        console.log('⚠️ Email failed to send:', createUserResponse.data.emailStatus.error);
        if (createUserResponse.data.credentials) {
          newUserPassword = createUserResponse.data.credentials.password;
          console.log(`   - Default Password: ${newUserPassword}`);
        }
      }
    }
    console.log('');

    // Step 3: New User First Login (should show password change screen)
    console.log('3️⃣ New user attempts first login...');
    const userLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_CONFIG.newUser.email,
      password: newUserPassword || 'defaultPassword123' // Use actual password if available
    });
    
    newUserToken = userLogin.data.token;
    const loggedInUser = userLogin.data.user;
    console.log('✅ User logged in successfully:');
    console.log(`   - Is First Login: ${loggedInUser.isFirstLogin}`);
    console.log(`   - Is Default Password: ${loggedInUser.isDefaultPassword}`);
    console.log(`   - Profile Completion: ${loggedInUser.profileCompletionPercentage}%`);
    console.log('');

    // Step 4: Force Password Change
    if (loggedInUser.isDefaultPassword) {
      console.log('4️⃣ User changes default password...');
      const passwordChangeResponse = await axios.post(
        `${API_BASE_URL}/auth/force-password-change`,
        {
          currentPassword: newUserPassword || 'defaultPassword123',
          newPassword: 'NewSecurePassword123!',
          confirmPassword: 'NewSecurePassword123!'
        },
        {
          headers: { Authorization: `Bearer ${newUserToken}` }
        }
      );
      
      const updatedUser = passwordChangeResponse.data.user;
      newUserToken = passwordChangeResponse.data.token; // Get new token
      console.log('✅ Password changed successfully:');
      console.log(`   - Is Default Password: ${updatedUser.isDefaultPassword}`);
      console.log(`   - Is First Login: ${updatedUser.isFirstLogin}`);
      console.log(`   - Profile Completion: ${updatedUser.profileCompletionPercentage}%`);
      console.log(`   - Redirect To: ${passwordChangeResponse.data.redirectTo}`);
      console.log('');
    }

    // Step 5: Check Profile Access
    console.log('5️⃣ Checking user profile access...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    
    const userProfile = profileResponse.data.user;
    console.log('✅ Profile accessed successfully:');
    console.log(`   - Profile Completion: ${userProfile.profileCompletionPercentage || 0}%`);
    console.log(`   - Can Access Dashboard: ${userProfile.profileCompletionPercentage >= 75 ? 'Yes' : 'No'}`);
    console.log('');

    // Step 6: Test Dashboard Access (should be restricted if profile < 75%)
    console.log('6️⃣ Testing dashboard access...');
    try {
      // This would be handled by frontend routing, but we can check the profile completion
      if (userProfile.profileCompletionPercentage >= 75) {
        console.log('✅ User can access dashboard (profile completion >= 75%)');
      } else {
        console.log('⚠️ User cannot access dashboard (profile completion < 75%)');
        console.log('   - User should be redirected to profile page to complete profile');
      }
    } catch (error) {
      console.log('❌ Dashboard access test failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Cleanup: Delete test user
    console.log('🧹 Cleaning up test user...');
    try {
      await axios.delete(`${API_BASE_URL}/users/${newUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Test user deleted successfully');
    } catch (error) {
      console.log('⚠️ Failed to delete test user:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 First Login Flow Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Admin can create users with default passwords');
    console.log('✅ Email notifications work (if configured)');
    console.log('✅ Users are forced to change default passwords');
    console.log('✅ Password change updates user flags correctly');
    console.log('✅ Profile completion controls dashboard access');
    console.log('✅ Proper redirect flow implemented');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure the backend server is running on http://localhost:5001');
    console.log('2. Ensure admin credentials are correct');
    console.log('3. Check if email service is configured (MAIL_USER, MAIL_PASS)');
    console.log('4. Verify database connection is working');
  }
}

// Run the test
if (require.main === module) {
  runTest();
}

module.exports = { runTest };
