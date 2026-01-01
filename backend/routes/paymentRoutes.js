import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import { authenticate } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();

// Configure PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

// Create PayPal order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { products, amount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const items = [];

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

      items.push({
        name: product.name.substring(0, 127), // PayPal limit
        unit_amount: {
          currency_code: 'USD',
          value: product.price.toFixed(2),
        },
        quantity: item.quantity.toString(),
      });
    }

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: items,
        },
      ],
      application_context: {
        brand_name: 'ShopEase',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      },
    });

    const order = await client().execute(request);

    res.json({
      orderId: order.result.id,
      approveUrl: order.result.links.find((link) => link.rel === 'approve').href,
    });
  } catch (error) {
    console.error('Create PayPal order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Capture PayPal order and create order in database
router.post('/capture-order', authenticate, async (req, res) => {
  try {
    const { orderId, products } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Capture the PayPal order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Payment completed, create order in database
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
        imageUrl: product.imageUrl,
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order in database
    const order = new Order({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      paymentId: capture.result.purchase_units[0].payments.captures[0].id,
      paymentOrderId: orderId,
      status: 'confirmed',
    });

    await order.save();

    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id },
    });

    res.json({
      success: true,
      order,
      message: 'Payment successful and order placed',
    });
  } catch (error) {
    console.error('Capture PayPal order error:', error);
    res.status(500).json({ message: 'Failed to capture payment' });
  }
});

export default router;
