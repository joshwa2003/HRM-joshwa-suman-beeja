const fs = require('fs');
const path = require('path');

console.log('🔧 Email Configuration Setup for HRM System');
console.log('='.repeat(50));

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  
  // Read current .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if email configuration exists
  const hasMailUser = envContent.includes('MAIL_USER=');
  const hasMailPass = envContent.includes('MAIL_PASS=');
  
  if (hasMailUser && hasMailPass) {
    console.log('✅ Email configuration found in .env file');
    
    // Check if values are set (not empty)
    const mailUserMatch = envContent.match(/MAIL_USER=(.+)/);
    const mailPassMatch = envContent.match(/MAIL_PASS=(.+)/);
    
    if (mailUserMatch && mailUserMatch[1] && mailUserMatch[1].trim() !== '' &&
        mailPassMatch && mailPassMatch[1] && mailPassMatch[1].trim() !== '') {
      console.log('✅ Email credentials are configured');
      console.log('📧 Email User:', mailUserMatch[1]);
      console.log('🔐 Email Password: [CONFIGURED]');
    } else {
      console.log('⚠️  Email credentials are empty - please update them');
      console.log('📝 Edit the .env file and set your email credentials');
    }
  } else {
    console.log('❌ Email configuration missing from .env file');
    console.log('📝 Please add the following to your .env file:');
    console.log('');
    console.log('MAIL_HOST=smtp.gmail.com');
    console.log('MAIL_USER=your-email@gmail.com');
    console.log('MAIL_PASS=your-app-password');
    console.log('FRONTEND_URL=http://localhost:3000');
  }
} else {
  console.log('❌ .env file not found');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from template');
    console.log('📝 Please edit the .env file and configure your email credentials');
  } else {
    console.log('📝 Creating basic .env file...');
    const basicEnv = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hrm_system

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Email Configuration (REQUIRED for sending user credentials)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password-here
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created');
    console.log('📝 Please edit the .env file and configure your email credentials');
  }
}

console.log('');
console.log('📚 Next Steps:');
console.log('1. Edit the .env file with your email credentials');
console.log('2. For Gmail: Enable 2FA and generate an App Password');
console.log('3. Restart the backend server: npm start');
console.log('4. Test email sending: node test-user-creation-email.js');
console.log('');
console.log('📖 For detailed instructions, see: EMAIL_SETUP_GUIDE.md');
