import twilio from 'twilio';

// Initialize Twilio client
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    console.log('🔍 Checking Twilio credentials...');
    console.log('TWILIO_ACCOUNT_SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
    console.log('TWILIO_AUTH_TOKEN:', authToken ? 'SET (hidden)' : 'NOT SET');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');

    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not configured. SMS functionality will be disabled.');
      return null;
    }

    try {
      twilioClient = twilio(accountSid, authToken);
      console.log('✅ Twilio client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio client:', error.message);
      return null;
    }
  }
  return twilioClient;
};

/**
 * Send SMS notification to user about order status update
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {string} customerName - Customer name
 * @returns {Promise<boolean>} - Returns true if SMS sent successfully
 */
export const sendOrderStatusSMS = async (phoneNumber, orderId, status, customerName = 'Customer') => {
  try {
    console.log(`🔍 Twilio Service - Starting SMS send:`, {
      phoneNumber,
      orderId,
      status,
      customerName
    });

    const client = getTwilioClient();
    if (!client) {
      console.log('⚠️ Twilio client not available, skipping SMS');
      console.log('Environment check:', {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || 'Missing'
      });
      return false;
    }

    // Format phone number (ensure it starts with +)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      // If no country code, assume India (+91)
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    console.log(`📱 Formatted phone number: ${formattedPhone}`);

    // Status messages
    const statusMessages = {
      'pending': 'is pending confirmation',
      'confirmed': 'has been confirmed',
      'packed': 'has been packed and is ready for dispatch',
      'delivered': 'has been delivered',
      'cancelled': 'has been cancelled'
    };

    const statusMessage = statusMessages[status] || 'status has been updated';
    const shortOrderId = orderId.slice(-8).toUpperCase();

    // Compose SMS message
    const message = `Hello ${customerName}! Your order #${shortOrderId} ${statusMessage}. Thank you for shopping with ShopEase!`;

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhoneNumber) {
      console.error('❌ TWILIO_PHONE_NUMBER not configured');
      return false;
    }

    console.log(`📤 Sending SMS:`, {
      from: twilioPhoneNumber,
      to: formattedPhone,
      message: message.substring(0, 50) + '...'
    });

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ SMS sent successfully to ${formattedPhone}. SID: ${result.sid}`);
    console.log(`📊 SMS Status: ${result.status}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.error('Error code:', error.code);
    
    // Handle specific Twilio error codes
    if (error.code === 21608) {
      console.error('⚠️ TWILIO TRIAL ACCOUNT LIMITATION:');
      console.error('   This phone number is not verified in your Twilio account.');
      console.error('   Trial accounts can only send SMS to verified numbers.');
      console.error('   Solutions:');
      console.error('   1. Verify the number at: https://www.twilio.com/user/account/phone-numbers/verified');
      console.error('   2. Upgrade your Twilio account to send to unverified numbers');
      console.error(`   3. Phone number to verify: ${formattedPhone}`);
    } else if (error.code === 21211) {
      console.error('⚠️ INVALID PHONE NUMBER:', formattedPhone);
    } else if (error.code === 21408) {
      console.error('⚠️ TWILIO PHONE NUMBER NOT OWNED:');
      console.error('   The "from" number is not owned by your account.');
    }
    
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status
    });
    // Don't throw error - SMS failure shouldn't break order update
    return false;
  }
};

/**
 * Send order placed confirmation SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} orderId - Order ID
 * @param {number} totalAmount - Order total amount
 * @param {string} customerName - Customer name
 * @returns {Promise<boolean>}
 */
export const sendOrderPlacedSMS = async (phoneNumber, orderId, totalAmount, customerName = 'Customer') => {
  try {
    console.log(`🔍 Twilio Service - Order Placed SMS:`, {
      phoneNumber,
      orderId,
      totalAmount,
      customerName
    });

    const client = getTwilioClient();
    if (!client) {
      console.log('⚠️ Twilio client not available, skipping SMS');
      return false;
    }

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    console.log(`📱 Formatted phone number: ${formattedPhone}`);

    const shortOrderId = orderId.slice(-8).toUpperCase();
    const message = `Hello ${customerName}! Your order #${shortOrderId} of ₹${totalAmount.toFixed(2)} has been placed successfully. We'll keep you updated! Thank you for shopping with ShopEase!`;

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhoneNumber) {
      console.error('❌ TWILIO_PHONE_NUMBER not configured');
      return false;
    }

    console.log(`📤 Sending order confirmation SMS:`, {
      from: twilioPhoneNumber,
      to: formattedPhone,
      message: message.substring(0, 50) + '...'
    });

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ Order confirmation SMS sent to ${formattedPhone}. SID: ${result.sid}`);
    console.log(`📊 SMS Status: ${result.status}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation SMS:', error.message);
    console.error('Error code:', error.code);
    
    // Handle specific Twilio error codes
    if (error.code === 21608) {
      console.error('⚠️ TWILIO TRIAL ACCOUNT LIMITATION:');
      console.error('   This phone number is not verified in your Twilio account.');
      console.error('   Trial accounts can only send SMS to verified numbers.');
      console.error('   Solutions:');
      console.error('   1. Verify the number at: https://www.twilio.com/user/account/phone-numbers/verified');
      console.error('   2. Upgrade your Twilio account to send to unverified numbers');
      console.error(`   3. Phone number to verify: ${formattedPhone}`);
    } else if (error.code === 21211) {
      console.error('⚠️ INVALID PHONE NUMBER:', formattedPhone);
    } else if (error.code === 21408) {
      console.error('⚠️ TWILIO PHONE NUMBER NOT OWNED:');
      console.error('   The "from" number is not owned by your account.');
    }
    
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status
    });
    return false;
  }
};

export default {
  sendOrderStatusSMS,
  sendOrderPlacedSMS
};


