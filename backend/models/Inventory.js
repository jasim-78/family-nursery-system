const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Plants',
      'Pots',
      'Fertilizers',
      'Soil Bags',
      'Covers',
      'Seeds',
      'Gardening Tools',
      'Cocopeat',
      'Manure',
      'Pesticides',
      'Repotting Materials'
    ],
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    default: 'pcs',
    trim: true,
  },
  buyingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  minimumStock: {
    type: Number,
    default: 5,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
