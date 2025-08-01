require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const emailService = require('./services/emailService');

async function testCreateUserWithEmail() {
  console.log('🧪 Testing User Creation with Email...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test user data
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'joshwaanbaiah@gmail.com', // Using the email from your screenshot
      password: 'TempPassword123!',
      role: 'Employee',
      employeeId: 'TEST001',
      isActive: true,
      sendEmail: true
    };

    console.log('📧 Testing email sending to:', testUserData.email);

    // Test the email service directly
    const emailResult = await emailService.sendNewUserCredentials({
      to: testUserData.email,
      firstName: testUserData.firstName,
      lastName: testUserData.lastName,
      email: testUserData.email,
      password: testUserData.password,
      employeeId: testUserData.employeeId
    });

    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', emailResult.messageId);
      console.log('🎯 Email sent to:', testUserData.email);
      console.log('📝 Check the inbox for the email with login credentials');
    } else {
      console.log('❌ Email failed to send:', emailResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCreateUserWithEmail();
