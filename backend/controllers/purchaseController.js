const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('itemId', 'itemName category unit')
      .populate('supplierId', 'supplierName phone')
      .sort({ date: -1 });

    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a purchase (and increase stock, admin only)
// @route   POST /api/purchases
// @access  Private/Admin
const createPurchase = async (req, res) => {
  try {
    const { itemId, quantityPurchased, buyingPrice, supplierId, date } = req.body;

    // 1. Check if inventory item exists
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const price = buyingPrice || item.buyingPrice;
    const totalAmount = quantityPurchased * price;

    // 2. Create Purchase record
    const purchase = await Purchase.create({
      itemId,
      quantityPurchased,
      buyingPrice: price,
      totalAmount,
      supplierId: supplierId || item.supplier,
      date: date || Date.now()
    });

    // 3. Increment stock quantity in inventory
    item.quantity += quantityPurchased;
    // Optionally update buyingPrice if it changed
    if (buyingPrice) {
      item.buyingPrice = buyingPrice;
    }
    await item.save();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('itemId', 'itemName category unit')
      .populate('supplierId', 'supplierName phone');

    res.status(201).json({ success: true, data: populatedPurchase });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a purchase record (reverts stock, admin only)
// @route   DELETE /api/purchases/:id
// @access  Private/Admin
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }

    // Revert stock (decrease stock)
    const item = await Inventory.findById(purchase.itemId);
    if (item) {
      // Ensure quantity won't go below 0
      if (item.quantity >= purchase.quantityPurchased) {
        item.quantity -= purchase.quantityPurchased;
        await item.save();
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete purchase. Inventory quantity is less than purchase quantity (items already sold).' 
        });
      }
    }

    await Purchase.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Purchase record deleted and inventory stock reverted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPurchases,
  createPurchase,
  deletePurchase
};
