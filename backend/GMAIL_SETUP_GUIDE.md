# Gmail App Password Setup - Step by Step Guide

## The Problem
You're getting: `Invalid login: 535-5.7.8 Username and Password not accepted`

This means Gmail is rejecting your credentials. You **MUST** use an App Password, not your regular Gmail password.

## Solution: Generate a Gmail App Password

### Step 1: Enable 2-Factor Authentication (Required)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "How you sign in to Google", find **2-Step Verification**
4. If it's OFF, click it and follow the steps to enable it
   - You'll need to verify your phone number
   - Google will send you a verification code
5. **Important**: You CANNOT create an App Password without 2FA enabled!

### Step 2: Generate App Password

1. Go directly to App Passwords: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords (at the bottom)

2. If you see a message saying "2-Step Verification is off", you need to enable it first (Step 1)

3. Select app: Choose **Mail**

4. Select device: Choose **Other (Custom name)**

5. Enter name: Type **ShopEase** (or any name you prefer)

6. Click **Generate**

7. **IMPORTANT**: Google will show you a 16-character password like:
   ```
   abcd efgh ijkl mnop
   ```
   - **Copy this password immediately** (you won't see it again!)
   - **Remove ALL spaces** when adding to .env file
   - Example: `abcdefghijklmnop` (no spaces)

### Step 3: Update Your .env File

Open `backend/.env` and update:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deepsbala15@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=deepsbala15@gmail.com
```

**Important Notes:**
- `EMAIL_USER` should be your full Gmail address
- `EMAIL_PASSWORD` should be the 16-character App Password (NO SPACES)
- `EMAIL_FROM` should match `EMAIL_USER`
- Make sure there are NO spaces around the `=` sign
- Make sure there are NO quotes around the values

### Step 4: Test Again

After updating your .env file:

```bash
cd backend
npm run test-email
```

You should see:
```
✅ SMTP connection verified successfully!
✅ Test email sent successfully!
```

### Step 5: Restart Your Server

After the test passes, restart your server:

```bash
npm run dev
```

Or if running in production:
```bash
npm start
```

## Common Mistakes to Avoid

❌ **Using your regular Gmail password** - Won't work, must use App Password
❌ **Leaving spaces in App Password** - Remove all spaces: `abcd efgh` → `abcdefgh`
❌ **2FA not enabled** - App Passwords require 2FA
❌ **Wrong email address** - EMAIL_USER must match the account you generated the App Password for
❌ **Quotes around password** - Don't use quotes: `EMAIL_PASSWORD="abcd..."` ❌
❌ **Spaces around =** - Don't use: `EMAIL_PASSWORD = abcd` ❌

## Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Double-check 2FA is enabled**: https://myaccount.google.com/security
2. **Generate a NEW App Password** (delete the old one and create a new one)
3. **Verify no spaces in password**: Copy the password exactly, remove spaces
4. **Check .env file location**: Must be in `backend/.env` (same folder as `server.js`)
5. **Restart server**: Environment variables are loaded when server starts
6. **Check for typos**: Make sure EMAIL_USER matches your Gmail address exactly

## Alternative: Use a Different Email Provider

If Gmail continues to cause issues, you can use:

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

Note: Yahoo also requires App Passwords if 2FA is enabled.

