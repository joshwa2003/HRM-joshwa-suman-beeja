require('dotenv').config();
const axios = require('axios');

async function testUserCreationAPI() {
  console.log('🧪 Testing User Creation API with Email...');
  
  try {
    // First, login as admin to get the token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@company.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Now create a user with email enabled
    console.log('👤 Creating user with email enabled...');
    const userData = {
      firstName: 'Test',
      lastName: 'EmailUser',
      email: 'joshwaanbaiah@gmail.com',
      password: 'TestPassword123!',
      role: 'Employee',
      department: '',
      employeeId: 'TEST003',
      phoneNumber: '+919790969603',
      designation: 'Test Developer',
      joiningDate: '2025-01-31',
      isActive: true,
      sendEmail: true // This is the key flag
    };

    const createUserResponse = await axios.post('http://localhost:5001/api/users', userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📧 User Creation Response:');
    console.log('Success:', createUserResponse.data.success);
    console.log('Message:', createUserResponse.data.message);
    
    if (createUserResponse.data.emailStatus) {
      console.log('📧 Email Status:');
      console.log('  - Sent:', createUserResponse.data.emailStatus.sent);
      if (createUserResponse.data.emailStatus.error) {
        console.log('  - Error:', createUserResponse.data.emailStatus.error);
      }
    }

    if (createUserResponse.data.credentials) {
      console.log('🔑 Manual Credentials (email failed):');
      console.log('  - Email:', createUserResponse.data.credentials.email);
      console.log('  - Password:', createUserResponse.data.credentials.password);
    }

    if (createUserResponse.data.success && createUserResponse.data.emailStatus?.sent) {
      console.log('🎉 SUCCESS: User created and email sent!');
      console.log('📧 Check the inbox at joshwaanbaiah@gmail.com');
    } else if (createUserResponse.data.success) {
      console.log('⚠️  User created but email failed to send');
    } else {
      console.log('❌ User creation failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserCreationAPI();
