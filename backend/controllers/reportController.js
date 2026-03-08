import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Helper to escape CSV fields
const escapeCsvField = (value) => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Product stock report (CSV)
export const getProductStockReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1, name: 1 });

    const header = [
      'Product Name',
      'Category',
      'Unit',
      'Price',
      'Remaining Stock',
      'Tags',
      'Created At',
    ];

    const rows = products.map((p) => [
      escapeCsvField(p.name),
      escapeCsvField(p.category),
      escapeCsvField(p.unit || 'piece'),
      escapeCsvField(p.price),
      escapeCsvField(p.stock),
      escapeCsvField((p.tags || []).join('; ')),
      escapeCsvField(p.createdAt?.toISOString() || ''),
    ].join(','));

    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product-stock-report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Get product stock report error:', error);
    res.status(500).json({ message: 'Error generating product stock report' });
  }
};

// Purchase report (CSV)
export const getPurchaseReport = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ date: -1 });

    const header = [
      'Order ID',
      'Order Date',
      'Status',
      'Customer Name',
      'Customer Email',
      'Payment Method',
      'Product Name',
      'Product ID',
      'Quantity',
      'Unit',
      'Price',
      'Line Total',
      'Order Total',
      'Shipping Name',
      'Shipping Phone',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'Pincode',
      'Country',
    ];

    const rows = [];

    for (const order of orders) {
      const customerName = order.userId && typeof order.userId === 'object'
        ? order.userId.name
        : '';
      const customerEmail = order.userId && typeof order.userId === 'object'
        ? order.userId.email
        : '';

      for (const item of order.products) {
        const lineTotal = item.price * item.quantity;

        rows.push([
          escapeCsvField(order._id.toString()),
          escapeCsvField(order.date?.toISOString() || ''),
          escapeCsvField(order.status),
          escapeCsvField(customerName),
          escapeCsvField(customerEmail),
          escapeCsvField(order.paymentMethod || ''),
          escapeCsvField(item.name),
          escapeCsvField(item.productId?.toString() || ''),
          escapeCsvField(item.quantity),
          escapeCsvField(item.unit || 'piece'),
          escapeCsvField(item.price),
          escapeCsvField(lineTotal),
          escapeCsvField(order.totalAmount),
          escapeCsvField(order.shippingAddress?.fullName || ''),
          escapeCsvField(order.shippingAddress?.phone || ''),
          escapeCsvField(order.shippingAddress?.addressLine1 || ''),
          escapeCsvField(order.shippingAddress?.addressLine2 || ''),
          escapeCsvField(order.shippingAddress?.city || ''),
          escapeCsvField(order.shippingAddress?.state || ''),
          escapeCsvField(order.shippingAddress?.pincode || ''),
          escapeCsvField(order.shippingAddress?.country || ''),
        ].join(','));
      }
    }

    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="purchase-report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Get purchase report error:', error);
    res.status(500).json({ message: 'Error generating purchase report' });
  }
};

