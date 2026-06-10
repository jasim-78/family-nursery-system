const mongoose = require('mongoose');

const plantLossSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityLost: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    trim: true,
  },
  lossType: {
    type: String,
    required: true,
    enum: ['Damaged', 'Dead', 'Diseased', 'Stolen', 'Other'],
    default: 'Dead',
  },
  estimatedLossAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  photoUrl: {
    type: String,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlantLoss', plantLossSchema);
