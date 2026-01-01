import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Rice', 'Pulses', 'Oils', 'Snacks', 'Beverages', 'Spices', 'Dairy', 'Household']
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'L', 'mL', 'piece', 'pack', 'dozen', 'box'],
    default: 'piece'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;

