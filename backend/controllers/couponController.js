import Coupon from '../models/Coupon.js';

// Admin: create coupon
export const createCoupon = async (req, res) => {
  try {
    let { code, description, discountType, discountValue, minAmount, expiryDate, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res
        .status(400)
        .json({ message: 'Code, discount type, discount value and expiry date are required' });
    }

    code = code.toUpperCase().trim();

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      description,
      discountType,
      discountValue,
      minAmount: minAmount || 0,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true,
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Error creating coupon' });
  }
};

// Admin: get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Error fetching coupons' });
  }
};

// Customer: get active coupons
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
    }).sort({ expiryDate: 1 });
    res.json(coupons);
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({ message: 'Error fetching active coupons' });
  }
};

// Apply coupon to amount
export const applyCoupon = async (req, res) => {
  try {
    let { code, amount } = req.body;

    if (!code || amount === undefined) {
      return res.status(400).json({ message: 'Coupon code and amount are required' });
    }

    amount = Number(amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    code = code.toUpperCase().trim();

    const now = new Date();
    const coupon = await Coupon.findOne({ code });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiryDate < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.minAmount && amount < coupon.minAmount) {
      return res
        .status(400)
        .json({ message: `Minimum order amount for this coupon is ₹${coupon.minAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed order total
    if (discount > amount) {
      discount = amount;
    }

    // Round to 2 decimals
    discount = Number(discount.toFixed(2));
    const finalAmount = Number((amount - discount).toFixed(2));

    res.json({
      success: true,
      discount,
      finalAmount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minAmount: coupon.minAmount,
        expiryDate: coupon.expiryDate,
      },
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
};

// Admin: delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Error deleting coupon' });
  }
};

