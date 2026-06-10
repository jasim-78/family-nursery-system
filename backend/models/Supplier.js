const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  suppliedItems: [{
    type: String,
    trim: true,
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
