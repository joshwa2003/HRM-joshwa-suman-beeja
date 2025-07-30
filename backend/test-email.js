const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('   MAIL_HOST:', process.env.MAIL_HOST || 'Not set (will use smtp.gmail.com)');
  console.log('   MAIL_USER:', process.env.MAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('   MAIL_PASS:', process.env.MAIL_PASS ? '✅ Set' : '❌ Not set');
  console.log('');
  
  // Test sending a simple email
  console.log('📧 Testing email sending...');
  
  const testResult = await emailService.sendEmail(
    'test@example.com',
    'Test Email from Beeja HRM',
    '<h1>Test Email</h1><p>This is a test email to verify the email service is working.</p>'
  );
  
  console.log('📧 Test Result:', testResult);
  
  if (testResult.success) {
    console.log('✅ Email service is working correctly!');
  } else {
    console.log('❌ Email service has issues:', testResult.error);
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure MAIL_USER and MAIL_PASS are set in your .env file');
    console.log('   2. If using Gmail, use an App Password instead of your regular password');
    console.log('   3. Enable "Less secure app access" or use OAuth2 for Gmail');
    console.log('   4. Check if your email provider allows SMTP connections');
  }
}

// Run the test
testEmailService().catch(console.error);
