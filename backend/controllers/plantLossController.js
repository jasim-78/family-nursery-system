const PlantLoss = require('../models/PlantLoss');
const Inventory = require('../models/Inventory');

// @desc    Get all plant losses
// @route   GET /api/plant-losses
// @access  Private
const getPlantLosses = async (req, res) => {
  try {
    const losses = await PlantLoss.find()
      .populate('itemId', 'itemName category unit buyingPrice')
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: losses.length, data: losses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a plant loss record (and reduce stock, supports file upload)
// @route   POST /api/plant-losses
// @access  Private
const createPlantLoss = async (req, res) => {
  try {
    const { itemId, quantityLost, reason, lossType, date } = req.body;

    const qty = parseInt(quantityLost, 10);

    // 1. Verify item exists
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // 2. Validate stock availability
    if (item.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock to record loss. Available: ${item.quantity}, Lost request: ${qty}`
      });
    }

    // 3. Estimate Loss Amount (quantity lost * buying price)
    const estimatedLossAmount = qty * item.buyingPrice;

    // 4. Resolve photoUrl if file was uploaded
    let photoUrl = '';
    if (req.file) {
      // We will save relative path or file name. Serving it as static upload
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // 5. Create plant loss record
    const plantLoss = await PlantLoss.create({
      itemId,
      quantityLost: qty,
      reason,
      lossType: lossType || 'Dead',
      estimatedLossAmount,
      photoUrl,
      addedBy: req.user._id,
      date: date || Date.now()
    });

    // 6. Reduce stock from Inventory
    item.quantity -= qty;
    await item.save();

    const populatedLoss = await PlantLoss.findById(plantLoss._id)
      .populate('itemId', 'itemName category unit buyingPrice')
      .populate('addedBy', 'name');

    res.status(201).json({ success: true, data: populatedLoss });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete plant loss record (reverts stock, admin only)
// @route   DELETE /api/plant-losses/:id
// @access  Private/Admin
const deletePlantLoss = async (req, res) => {
  try {
    const loss = await PlantLoss.findById(req.params.id);
    if (!loss) {
      return res.status(404).json({ success: false, message: 'Plant loss record not found' });
    }

    // Revert stock (increase stock back)
    const item = await Inventory.findById(loss.itemId);
    if (item) {
      item.quantity += loss.quantityLost;
      await item.save();
    }

    await PlantLoss.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Plant loss record deleted and inventory stock restored' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPlantLosses,
  createPlantLoss,
  deletePlantLoss
};
