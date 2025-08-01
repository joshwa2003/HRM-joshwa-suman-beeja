require('dotenv').config();
const emailService = require('./services/emailService');

async function testUserCreationEmail() {
  console.log('Testing user creation email functionality...');
  
  try {
    const testData = {
      to: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TempPassword123!',
      employeeId: 'EMP001'
    };
    
    const result = await emailService.sendNewUserCredentials(testData);
    
    if (result.success) {
      console.log('✅ Email service is working correctly!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email service failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing email service:', error.message);
  }
}

testUserCreationEmail();
