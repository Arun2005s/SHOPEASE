# Email Setup Guide for ShopEase

## Overview

The application now sends email notifications to customers for:
- Order confirmation when order is placed
- Order status updates (pending, confirmed, packed, delivered, cancelled)

## Environment Variables Required

Add these to your `.env` file in the `backend` folder:

```env
# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Other (Custom name)**
3. Enter "ShopEase" as the name
4. Click **Generate**
5. Copy the 16-character password (no spaces)
6. Use this password as `EMAIL_PASSWORD` in your `.env` file

### Step 3: Configure .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Use the app password from Step 2
EMAIL_FROM=your-email@gmail.com
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

## Testing

1. **Install nodemailer** (if not already installed):
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Add environment variables** to your `.env` file

3. **Restart your server**

4. **Place a test order** - You should see email logs in console:
   ```
   📧 Order Placed - Attempting to send email to customer@email.com
   ✅ Order confirmation email sent successfully
   ```

5. **Change order status** - Customer should receive status update email

## Email Templates

The application uses beautiful HTML email templates with:
- Professional design with ShopEase branding
- Order details (ID, items, total amount)
- Shipping address (for order confirmation)
- Status-specific messaging and colors
- Responsive design for mobile devices

## Troubleshooting

### Step 1: Test Your Email Configuration

Run the email test script to diagnose issues:

```bash
cd backend
npm run test-email
```

This script will:
- ✅ Check if .env file exists and is loaded
- ✅ Verify all email environment variables are set
- ✅ Test SMTP connection
- ✅ Send a test email to verify everything works

### Common Errors and Solutions

#### Error: "Invalid login" or "EAUTH"
- **For Gmail**: Make sure you're using an **App Password**, not your regular password
- Check that 2FA is enabled on your Google account
- Verify EMAIL_USER matches the email you generated the app password for
- Make sure EMAIL_PASSWORD has no spaces (remove spaces from the 16-character app password)

#### Error: "Connection timeout" or "ECONNECTION"
- Check your internet connection
- Verify EMAIL_HOST and EMAIL_PORT are correct
- Check firewall settings (port 587 or 465 should be open)
- For Gmail, try port 465 with secure: true:
  ```env
  EMAIL_PORT=465
  ```
  (Note: secure will be automatically set to true for port 465)

#### Error: "Email credentials not configured"
- Make sure `.env` file exists in the `backend` folder
- Verify all required variables are set:
  - EMAIL_HOST
  - EMAIL_PORT
  - EMAIL_USER
  - EMAIL_PASSWORD
  - EMAIL_FROM (optional, defaults to EMAIL_USER)
- Restart your server after adding/changing .env variables

#### Emails not sending (no error, but emails don't arrive)
- Check server console logs for detailed error messages
- Verify the customer's email address is correct in the database
- Check spam/junk folder
- Run the test script: `npm run test-email`
- Verify SMTP connection using the test script

#### Emails going to spam
- Use a verified domain email address
- Set up SPF and DKIM records for your domain
- Use a professional email address (not free email providers for production)
- Avoid using words like "test" or "spam" in email content

### Debugging Steps

1. **Check Environment Variables**
   ```bash
   cd backend
   npm run check-env
   ```

2. **Test Email Connection**
   ```bash
   cd backend
   npm run test-email
   ```

3. **Check Server Logs**
   - Look for email-related logs when placing an order
   - Check for error messages starting with ❌
   - Look for "Email transporter not available" warnings

4. **Verify .env File Location**
   - Make sure `.env` is in the `backend` folder (same folder as `server.js`)
   - Check that there are no typos in variable names
   - Ensure no extra spaces around `=` sign

5. **Restart Server**
   - After changing .env file, always restart your server
   - Environment variables are loaded when the server starts

## Features

✅ **Order Confirmation Email**: Sent when order is placed (both COD and online payment)
✅ **Status Update Emails**: Sent when order status changes
✅ **Beautiful HTML Templates**: Professional, responsive email design
✅ **Error Handling**: Graceful failure - order processing continues even if email fails
✅ **Detailed Logging**: All email attempts are logged for debugging

## Notes

- Email sending is **non-blocking** - order processing continues even if email fails
- Both SMS and Email are sent simultaneously
- Email templates include all order details for customer reference
- Email service gracefully handles missing configuration


