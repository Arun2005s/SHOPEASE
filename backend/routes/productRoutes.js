import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Get all products (public - for customers)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by name or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let products = await Product.find(query);

    // Sort products
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product (admin only)
router.post('/', authenticate, isAdmin, upload.single('image'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Rice', 'Pulses', 'Oils', 'Snacks', 'Beverages', 'Spices', 'Dairy', 'Household']).withMessage('Invalid category'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    let imageUrl = req.body.imageUrl;

    // Upload to Cloudinary if file provided
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: uploadError.message || 'Failed to upload image. Please check Cloudinary configuration.' 
        });
      }
    }

    const { name, price, category, tags, stock, unit } = req.body;

    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      imageUrl,
      stock: parseInt(stock),
      unit: unit || 'piece'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, price, category, tags, stock, imageUrl: newImageUrl } = req.body;

    // Handle image update
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (product.imageUrl) {
          await deleteFromCloudinary(product.imageUrl);
        }
        // Upload new image
        product.imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: uploadError.message || 'Failed to upload image. Please check Cloudinary configuration.' 
        });
      }
    } else if (newImageUrl && newImageUrl !== product.imageUrl) {
      // If new URL provided and different, delete old one
      if (product.imageUrl) {
        await deleteFromCloudinary(product.imageUrl);
      }
      product.imageUrl = newImageUrl;
    }

    // Update fields
    if (name) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (category) product.category = category;
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (stock !== undefined) product.stock = parseInt(stock);
    if (unit) product.unit = unit;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from Cloudinary
    if (product.imageUrl) {
      await deleteFromCloudinary(product.imageUrl);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router;

