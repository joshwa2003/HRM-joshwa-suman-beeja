require('dotenv').config();

console.log('🔍 Email Configuration Debug');
console.log('='.repeat(50));

// Check environment variables
console.log('Environment Variables:');
console.log('MAIL_HOST:', process.env.MAIL_HOST);
console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS:', process.env.MAIL_PASS ? '[SET]' : '[NOT SET]');
console.log('MAIL_PASS length:', process.env.MAIL_PASS ? process.env.MAIL_PASS.length : 0);

// Test nodemailer configuration
const nodemailer = require('nodemailer');

console.log('\n📧 Testing Nodemailer Configuration...');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

// Verify the connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Error:', error.message);
    console.log('Error Code:', error.code);
    console.log('Error Command:', error.command);
    
    // Provide specific troubleshooting
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting EAUTH Error:');
      console.log('1. Check if 2-Factor Authentication is enabled on Gmail');
      console.log('2. Generate a new App Password from Google Account settings');
      console.log('3. Make sure you\'re using the App Password, not your regular password');
      console.log('4. Check if the email address is correct');
    }
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('Server is ready to take our messages');
    
    // Test sending a simple email
    testSendEmail();
  }
});

async function testSendEmail() {
  console.log('\n📤 Testing Email Send...');
  
  try {
    const testEmail = {
      from: `"Beeja HRM Test" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // Send to self for testing
      subject: 'Test Email - HRM System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the HRM system.</p>
        <p>If you receive this, the email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.log('❌ Test email failed:', error.message);
  }
}
