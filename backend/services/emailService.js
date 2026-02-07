import nodemailer from 'nodemailer';

// Initialize email transporter
let emailTransporter = null;
let emailTransporterInitializing = false;

const getEmailTransporter = async () => {
  // If already initialized, return it
  if (emailTransporter) {
    return emailTransporter;
  }

  // If currently initializing, wait a bit and return null to avoid multiple initializations
  if (emailTransporterInitializing) {
    return null;
  }

  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  console.log('🔍 Checking Email credentials...');
  console.log('EMAIL_HOST:', emailHost);
  console.log('EMAIL_PORT:', emailPort);
  console.log('EMAIL_USER:', emailUser ? `${emailUser.substring(0, 5)}...` : 'NOT SET');
  console.log('EMAIL_PASSWORD:', emailPassword ? 'SET (hidden)' : 'NOT SET');
  console.log('EMAIL_FROM:', emailFrom || 'NOT SET');

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Email credentials not configured. Email functionality will be disabled.');
    return null;
  }

  emailTransporterInitializing = true;

  try {
    emailTransporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      // Add connection timeout
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    
    // Verify connection on initialization (but don't block if it fails)
    console.log('🔍 Verifying email connection...');
    try {
      await emailTransporter.verify();
      console.log('✅ Email transporter initialized and verified successfully');
    } catch (verifyError) {
      console.warn('⚠️ Email connection verification failed, but transporter created:', verifyError.message);
      console.warn('   Emails may still work. If not, check your SMTP settings.');
    }
    
    emailTransporterInitializing = false;
    return emailTransporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD.');
      console.error('   For Gmail, make sure you\'re using an App Password, not your regular password.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('💡 Connection failed. Check EMAIL_HOST, EMAIL_PORT, and your internet connection.');
    }
    emailTransporter = null; // Reset to allow retry
    emailTransporterInitializing = false;
    return null;
  }
};

/**
 * Create HTML email template for order status update
 */
const createOrderStatusEmailTemplate = (customerName, orderId, status, orderDetails) => {
  const shortOrderId = orderId.slice(-8).toUpperCase();
  
  const statusMessages = {
    'pending': {
      title: 'Order Pending Confirmation',
      message: 'Your order is pending confirmation. We will process it shortly.',
      color: '#f59e0b'
    },
    'confirmed': {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being prepared.',
      color: '#10b981'
    },
    'packed': {
      title: 'Order Packed',
      message: 'Your order has been packed and is ready for dispatch!',
      color: '#8b5cf6'
    },
    'delivered': {
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully. Thank you for shopping with us!',
      color: '#3b82f6'
    },
    'cancelled': {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact us.',
      color: '#ef4444'
    }
  };

  const statusInfo = statusMessages[status] || {
    title: 'Order Status Updated',
    message: 'Your order status has been updated.',
    color: '#6b7280'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - ShopEase</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ShopEase</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">Your Trusted Shopping Partner</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${customerName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${statusInfo.message}
              </p>
              
              <!-- Order Details Box -->
              <div style="background-color: #f9fafb; border-left: 4px solid ${statusInfo.color}; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Order ID:</strong>
                      <span style="color: #6b7280; margin-left: 10px;">#${shortOrderId}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Status:</strong>
                      <span style="color: ${statusInfo.color}; margin-left: 10px; font-weight: bold; text-transform: capitalize;">${status}</span>
                    </td>
                  </tr>
                  ${orderDetails.totalAmount ? `
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Total Amount:</strong>
                      <span style="color: #6b7280; margin-left: 10px;">₹${orderDetails.totalAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              ${orderDetails.products && orderDetails.products.length > 0 ? `
              <!-- Products List -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Order Items:</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  ${orderDetails.products.map(product => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 15px 0;">
                      <strong style="color: #374151;">${product.name}</strong>
                      <br>
                      <span style="color: #6b7280; font-size: 14px;">
                        Quantity: ${product.quantity} ${product.unit || 'piece'} × ₹${product.price} = ₹${(product.price * product.quantity).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
              
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                You can track your order status anytime from your account dashboard.
              </p>
              
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions or concerns, please don't hesitate to contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Thank you for shopping with ShopEase!
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Create HTML email template for order placed confirmation
 */
const createOrderPlacedEmailTemplate = (customerName, orderId, totalAmount, orderDetails) => {
  const shortOrderId = orderId.slice(-8).toUpperCase();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ShopEase</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ShopEase</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">Order Confirmation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${customerName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your order! We're excited to process it for you.
              </p>
              
              <!-- Order Details Box -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Order ID:</strong>
                      <span style="color: #6b7280; margin-left: 10px;">#${shortOrderId}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Total Amount:</strong>
                      <span style="color: #10b981; margin-left: 10px; font-weight: bold; font-size: 18px;">₹${totalAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                  ${orderDetails.paymentMethod ? `
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="color: #374151;">Payment Method:</strong>
                      <span style="color: #6b7280; margin-left: 10px; text-transform: capitalize;">${orderDetails.paymentMethod.replace('_', ' ')}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              ${orderDetails.products && orderDetails.products.length > 0 ? `
              <!-- Products List -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Order Items:</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  ${orderDetails.products.map(product => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 15px 0;">
                      <strong style="color: #374151;">${product.name}</strong>
                      <br>
                      <span style="color: #6b7280; font-size: 14px;">
                        Quantity: ${product.quantity} ${product.unit || 'piece'} × ₹${product.price} = ₹${(product.price * product.quantity).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
              
              ${orderDetails.shippingAddress ? `
              <!-- Shipping Address -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Shipping Address:</h3>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px;">
                  <p style="color: #374151; margin: 5px 0; font-size: 14px;">
                    ${orderDetails.shippingAddress.fullName}<br>
                    ${orderDetails.shippingAddress.addressLine1}<br>
                    ${orderDetails.shippingAddress.addressLine2 ? orderDetails.shippingAddress.addressLine2 + '<br>' : ''}
                    ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br>
                    ${orderDetails.shippingAddress.country || 'India'}<br>
                    Phone: ${orderDetails.shippingAddress.phone}
                  </p>
                </div>
              </div>
              ` : ''}
              
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                We'll send you updates about your order status via email and SMS. You can also track your order from your account dashboard.
              </p>
              
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions, please contact our support team. We're here to help!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Thank you for shopping with ShopEase!
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send order status update email to customer
 * @param {string} email - Recipient email address
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {string} customerName - Customer name
 * @param {object} orderDetails - Order details (totalAmount, products, etc.)
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
export const sendOrderStatusEmail = async (email, orderId, status, customerName = 'Customer', orderDetails = {}) => {
  try {
    console.log(`🔍 Email Service - Starting email send:`, {
      email,
      orderId,
      status,
      customerName
    });

    const transporter = await getEmailTransporter();
    if (!transporter) {
      console.log('⚠️ Email transporter not available, skipping email');
      return false;
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!emailFrom) {
      console.error('❌ EMAIL_FROM not configured');
      return false;
    }

    const htmlContent = createOrderStatusEmailTemplate(customerName, orderId, status, orderDetails);
    const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);

    console.log(`📤 Sending order status email:`, {
      from: emailFrom,
      to: email,
      subject: `Order ${statusTitle} - ShopEase`
    });

    const info = await transporter.sendMail({
      from: `"ShopEase" <${emailFrom}>`,
      to: email,
      subject: `Order ${statusTitle} - ShopEase`,
      html: htmlContent,
    });

    console.log(`✅ Order status email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order status email:', error.message);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return false;
  }
};

/**
 * Send order placed confirmation email
 * @param {string} email - Recipient email address
 * @param {string} orderId - Order ID
 * @param {number} totalAmount - Order total amount
 * @param {string} customerName - Customer name
 * @param {object} orderDetails - Order details (products, shippingAddress, paymentMethod)
 * @returns {Promise<boolean>}
 */
export const sendOrderPlacedEmail = async (email, orderId, totalAmount, customerName = 'Customer', orderDetails = {}) => {
  try {
    console.log(`🔍 Email Service - Order Placed Email:`, {
      email,
      orderId,
      totalAmount,
      customerName
    });

    const transporter = await getEmailTransporter();
    if (!transporter) {
      console.log('⚠️ Email transporter not available, skipping email');
      return false;
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!emailFrom) {
      console.error('❌ EMAIL_FROM not configured');
      return false;
    }

    const htmlContent = createOrderPlacedEmailTemplate(customerName, orderId, totalAmount, orderDetails);

    console.log(`📤 Sending order confirmation email:`, {
      from: emailFrom,
      to: email,
      subject: 'Order Confirmation - ShopEase'
    });

    const info = await transporter.sendMail({
      from: `"ShopEase" <${emailFrom}>`,
      to: email,
      subject: 'Order Confirmation - ShopEase',
      html: htmlContent,
    });

    console.log(`✅ Order confirmation email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return false;
  }
};

export default {
  sendOrderStatusEmail,
  sendOrderPlacedEmail
};


