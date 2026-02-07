import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { sendOrderStatusSMS, sendOrderPlacedSMS } from '../services/twilioService.js';
import { sendOrderStatusEmail, sendOrderPlacedEmail } from '../services/emailService.js';

const router = express.Router();

// Create order (customer only)
router.post('/', authenticate, [
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash_on_delivery', 'online_payment']).withMessage('Invalid payment method'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products, paymentMethod, shippingAddress } = req.body;
    let totalAmount = 0;
    const orderProducts = [];

    // Validate products and calculate total
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
        imageUrl: product.imageUrl
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Get user details
    const user = await User.findById(req.user._id);

    // Create order
    const order = new Order({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'confirmed'
    });

    await order.save();

    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id }
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
      console.log(`📱 Order Placed - Attempting to send SMS to ${shippingAddress.phone} for order ${order._id}`);
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
      console.log(`📧 Order Placed - Attempting to send email to ${customerEmail} for order ${order._id}`);
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

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ date: -1 })
      .populate('products.productId', 'name price imageUrl');
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get all orders (admin only) - MUST come before /:id route
router.get('/all', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const orders = await Order.find()
      .sort({ date: -1 })
      .populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order - MUST come after /all route
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name price imageUrl');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user or user is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Update order status (admin only)
router.put('/:id', authenticate, [
  body('status').isIn(['pending', 'confirmed', 'packed', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg || err.message);
      return res.status(400).json({ 
        message: errorMessages[0] || 'Validation error',
        errors: errors.array() 
      });
    }

    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = req.body.status;
    
    try {
      await order.save();
    } catch (saveError) {
      // Handle Mongoose validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation error',
          errors: validationErrors
        });
      }
      throw saveError; // Re-throw if it's not a validation error
    }

    // Send SMS and Email notification to customer when status changes
    if (oldStatus !== order.status) {
      try {
        // Get customer details
        let customerPhone = null;
        let customerEmail = null;
        let customerName = 'Customer';
        let customerUser = null;

        if (order.shippingAddress && order.shippingAddress.phone) {
          customerPhone = order.shippingAddress.phone;
        }

        // Get customer name and email - handle both populated and non-populated userId
        if (order.shippingAddress?.fullName) {
          customerName = order.shippingAddress.fullName;
        }
        
        if (order.userId && typeof order.userId === 'object' && order.userId.name) {
          customerName = order.userId.name;
          customerEmail = order.userId.email;
          customerUser = order.userId;
        } else if (order.userId && typeof order.userId === 'string') {
          // If userId is not populated, fetch user
          customerUser = await User.findById(order.userId);
          if (customerUser) {
            customerName = customerUser.name || customerName;
            customerEmail = customerUser.email;
          }
        }

        console.log(`📱📧 Notification Check - Order ${order._id}: Phone=${customerPhone}, Email=${customerEmail}, Status changed from ${oldStatus} to ${order.status}`);

        // Send SMS if phone number is available
        if (customerPhone) {
          console.log(`📤 Attempting to send SMS to ${customerPhone} for order ${order._id}`);
          const smsResult = await sendOrderStatusSMS(
            customerPhone,
            order._id.toString(),
            order.status,
            customerName
          );
          if (smsResult) {
            console.log(`✅ SMS sent successfully for order ${order._id}`);
          } else {
            console.log(`⚠️ SMS sending returned false for order ${order._id}`);
          }
        } else {
          console.log(`⚠️ No phone number found for order ${order._id}. Shipping address:`, order.shippingAddress);
        }

        // Send Email if email is available
        if (customerEmail) {
          console.log(`📤 Attempting to send email to ${customerEmail} for order ${order._id}`);
          const emailResult = await sendOrderStatusEmail(
            customerEmail,
            order._id.toString(),
            order.status,
            customerName,
            {
              totalAmount: order.totalAmount,
              products: order.products
            }
          );
          if (emailResult) {
            console.log(`✅ Email sent successfully for order ${order._id}`);
          } else {
            console.log(`⚠️ Email sending returned false for order ${order._id}`);
          }
        } else {
          console.log(`⚠️ No email found for order ${order._id}`);
        }
      } catch (notificationError) {
        console.error('❌ Error in notification process:', notificationError);
        console.error('Error details:', {
          message: notificationError.message,
          stack: notificationError.stack,
          orderId: order._id
        });
        // Continue even if notifications fail
      }
    }

    // Create notification if status changed significantly
    if (oldStatus !== order.status && order.status === 'delivered') {
      const adminUsers = await User.find({ role: 'admin' });
      const customer = await User.findById(order.userId);
      for (const admin of adminUsers) {
        await Notification.create({
          type: 'order_status_changed',
          title: 'Order Delivered',
          message: `Order ${order._id} has been delivered to ${customer?.name || 'customer'}`,
          orderId: order._id,
          userId: order.userId
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      message: error.message || 'Error updating order',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete order (customer can delete pending orders, admin can delete any)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    const isOwner = order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Customers can delete pending or confirmed orders (not delivered or already cancelled)
    if (!isAdmin && (order.status === 'delivered' || order.status === 'cancelled')) {
      return res.status(400).json({ message: 'This order cannot be cancelled' });
    }

    // Restore stock if order is being cancelled
    if (order.status === 'pending' || order.status === 'confirmed') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    // Update order status to cancelled instead of deleting
    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

export default router;

