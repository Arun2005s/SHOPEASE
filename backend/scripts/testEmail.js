import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  console.log('💡 Make sure .env file exists in the backend folder');
  process.exit(1);
}

console.log('✅ .env file loaded successfully\n');

// Check email environment variables
console.log('🔍 Checking Email Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || emailUser;

console.log('EMAIL_HOST:', emailHost);
console.log('EMAIL_PORT:', emailPort);
console.log('EMAIL_USER:', emailUser ? `${emailUser.substring(0, 5)}...` : '❌ NOT SET');
console.log('EMAIL_PASSWORD:', emailPassword ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('EMAIL_FROM:', emailFrom || '❌ NOT SET');

if (!emailUser || !emailPassword) {
  console.log('\n❌ Email configuration is incomplete!');
  console.log('\n📝 Please add these to your .env file:');
  console.log('   EMAIL_HOST=smtp.gmail.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASSWORD=your-app-password');
  console.log('   EMAIL_FROM=your-email@gmail.com');
  console.log('\n💡 For Gmail, you need to:');
  console.log('   1. Enable 2-Factor Authentication');
  console.log('   2. Generate an App Password: https://myaccount.google.com/apppasswords');
  console.log('   3. Use the 16-character app password (no spaces)');
  process.exit(1);
}

console.log('\n🔧 Creating email transporter...');

try {
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  console.log('✅ Transporter created successfully');

  // Verify connection
  console.log('\n🔍 Verifying SMTP connection...');
  await transporter.verify();
  console.log('✅ SMTP connection verified successfully!');

  // Send test email
  console.log('\n📧 Sending test email...');
  const testEmail = emailUser; // Send to self for testing
  
  const info = await transporter.sendMail({
    from: `"ShopEase Test" <${emailFrom}>`,
    to: testEmail,
    subject: 'ShopEase Email Test',
    html: `
      <h2>Email Test Successful! ✅</h2>
      <p>If you received this email, your email configuration is working correctly.</p>
      <p><strong>Configuration Details:</strong></p>
      <ul>
        <li>Host: ${emailHost}</li>
        <li>Port: ${emailPort}</li>
        <li>User: ${emailUser}</li>
      </ul>
      <p>You can now receive order confirmation and status update emails from ShopEase.</p>
    `,
  });

  console.log('✅ Test email sent successfully!');
  console.log('   Message ID:', info.messageId);
  console.log(`   Check your inbox: ${testEmail}`);
  console.log('\n🎉 Email setup is working correctly!');

} catch (error) {
  console.error('\n❌ Email test failed!');
  console.error('Error:', error.message);
  console.error('Code:', error.code);
  
  if (error.code === 'EAUTH') {
    console.error('\n💡 Authentication failed. Common issues:');
    console.error('   - For Gmail: Make sure you\'re using an App Password, not your regular password');
    console.error('   - Make sure 2FA is enabled on your Google account');
    console.error('   - Check that EMAIL_USER and EMAIL_PASSWORD are correct');
  } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
    console.error('\n💡 Connection failed. Common issues:');
    console.error('   - Check your internet connection');
    console.error('   - Verify EMAIL_HOST and EMAIL_PORT are correct');
    console.error('   - Check firewall settings');
    console.error('   - For Gmail, try port 465 with secure: true');
  } else if (error.code === 'EENVELOPE') {
    console.error('\n💡 Envelope error. Check EMAIL_FROM address.');
  }
  
  console.error('\nFull error details:', error);
  process.exit(1);
}

