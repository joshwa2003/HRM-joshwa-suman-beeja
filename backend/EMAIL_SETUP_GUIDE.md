# Email Configuration Guide for User Creation

## Issue
The email functionality is implemented but emails are not being sent because the email service lacks proper credentials.

## Solution
You need to configure email credentials in your environment variables.

## Step 1: Create/Update .env file
Create a `.env` file in the `backend` directory with the following email configuration:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Step 2: Gmail Setup (Recommended)
If using Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular password) in `MAIL_PASS`

## Step 3: Alternative Email Providers

### For Outlook/Hotmail:
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_USER=your-email@outlook.com
MAIL_PASS=your-password
```

### For Yahoo:
```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_USER=your-email@yahoo.com
MAIL_PASS=your-app-password
```

### For Custom SMTP:
```env
MAIL_HOST=your-smtp-server.com
MAIL_USER=your-email@yourdomain.com
MAIL_PASS=your-password
```

## Step 4: Test Email Configuration
Run this command to test email sending:

```bash
cd backend
node test-user-creation-email.js
```

## Step 5: Restart Backend Server
After configuring the .env file:

```bash
cd backend
npm start
```

## Expected Result
Once configured properly:
- ✅ Users will receive professional emails with login credentials
- ✅ Success messages will show "Login credentials have been sent to user's email"
- ✅ Email delivery status will be displayed in the admin interface

## Security Notes
- Never commit .env files to version control
- Use app passwords instead of regular passwords
- Keep email credentials secure
- Consider using environment-specific configurations for production

## Troubleshooting
If emails still don't send:
1. Check spam/junk folders
2. Verify email credentials are correct
3. Ensure 2FA and app passwords are set up correctly
4. Check firewall/network restrictions
5. Try a different email provider

## Current Status
- ✅ Email functionality is fully implemented
- ✅ Frontend has email toggle controls
- ✅ Backend handles email sending and error cases
- ❌ Email credentials need to be configured
