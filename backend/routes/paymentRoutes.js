import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendOrderPlacedSMS } from '../services/twilioService.js';
import { sendOrderPlacedEmail } from '../services/emailService.js';

const router = express.Router();

// Initialize Razorpay instance (lazy initialization)
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
    }
    
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

// Create Razorpay order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    // Validate products and calculate total amount from DB (never trust client amount)
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
    }

    const options = {
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: 'INR',
      receipt: `order_rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment and create order in database
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products, paymentMethod, shippingAddress } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment details are incomplete' });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    if (!paymentMethod || !shippingAddress) {
      return res.status(400).json({ message: 'Payment method and shipping address are required' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Signature verified - process order
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit || 'piece',
        imageUrl: product.imageUrl,
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Get user details
    const user = await User.findById(req.user._id);

    // Create order in database
    const order = new Order({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      paymentId: razorpay_payment_id,
      paymentOrderId: razorpay_order_id,
      paymentMethod,
      shippingAddress,
      status: 'confirmed',
    });

    await order.save();

    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id },
    });

    // Create notification for admin
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        type: 'order_placed',
        title: 'New Order Placed',
        message: `${user.name} (${user.email}) has placed a new order of ₹${totalAmount.toFixed(2)}. Order ID: ${order._id}`,
        orderId: order._id,
        userId: req.user._id
      });
    }

    // Send SMS and Email to customer when order is placed
    const customerName = shippingAddress?.fullName || user.name || 'Customer';
    const customerEmail = user.email;

    // Send SMS
    if (shippingAddress && shippingAddress.phone) {
      console.log(`📱 Order Placed (Payment) - Attempting to send SMS to ${shippingAddress.phone} for order ${order._id}`);
      const smsResult = await sendOrderPlacedSMS(
        shippingAddress.phone,
        order._id.toString(),
        totalAmount,
        customerName
      );
      if (smsResult) {
        console.log(`✅ Order confirmation SMS sent for order ${order._id}`);
      } else {
        console.log(`⚠️ Order confirmation SMS failed for order ${order._id}`);
      }
    } else {
      console.log(`⚠️ No phone number in shipping address for order ${order._id}`);
    }

    // Send Email
    if (customerEmail) {
      console.log(`📧 Order Placed (Payment) - Attempting to send email to ${customerEmail} for order ${order._id}`);
      const emailResult = await sendOrderPlacedEmail(
        customerEmail,
        order._id.toString(),
        totalAmount,
        customerName,
        {
          products: orderProducts,
          shippingAddress,
          paymentMethod
        }
      );
      if (emailResult) {
        console.log(`✅ Order confirmation email sent for order ${order._id}`);
      } else {
        console.log(`⚠️ Order confirmation email failed for order ${order._id}`);
      }
    } else {
      console.log(`⚠️ No email found for user ${user._id}`);
    }

    res.json({
      success: true,
      order,
      message: 'Payment successful and order placed',
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

export default router;
