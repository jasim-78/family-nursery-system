const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('itemId', 'itemName category unit')
      .populate('soldBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a sale (and reduce stock)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { itemId, quantitySold, sellingPrice, date } = req.body;

    // 1. Check if inventory item exists
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // 2. Validate stock availability
    if (item.quantity < quantitySold) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${item.quantity} ${item.unit}, Requested: ${quantitySold} ${item.unit}` 
      });
    }

    // 3. Compute price details
    const price = sellingPrice || item.sellingPrice;
    const totalAmount = quantitySold * price;

    // 4. Create Sale entry
    const sale = await Sale.create({
      itemId,
      quantitySold,
      sellingPrice: price,
      totalAmount,
      soldBy: req.user._id,
      date: date || Date.now()
    });

    // 5. Deduct from Inventory quantity
    item.quantity -= quantitySold;
    await item.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate('itemId', 'itemName category unit')
      .populate('soldBy', 'name');

    res.status(201).json({ success: true, data: populatedSale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a sale (reverts stock, admin only)
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    // Restore stock to inventory
    const item = await Inventory.findById(sale.itemId);
    if (item) {
      item.quantity += sale.quantitySold;
      await item.save();
    }

    await Sale.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Sale deleted and stock restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getSales,
  createSale,
  deleteSale
};
