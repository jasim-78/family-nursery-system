const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by search term
    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    // Filter for low stock
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    }

    const items = await Inventory.find(query)
      .populate('supplier', 'supplierName phone')
      .populate('createdBy', 'name')
      .sort({ itemName: 1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('supplier', 'supplierName phone')
      .populate('createdBy', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
const createInventoryItem = async (req, res) => {
  try {
    const { itemName, category, quantity, unit, buyingPrice, sellingPrice, supplier, minimumStock } = req.body;

    const item = await Inventory.create({
      itemName,
      category,
      quantity: quantity || 0,
      unit: unit || 'pcs',
      buyingPrice: buyingPrice || 0,
      sellingPrice: sellingPrice || 0,
      supplier: supplier || null,
      minimumStock: minimumStock || 5,
      createdBy: req.user._id
    });

    const populatedItem = await Inventory.findById(item._id).populate('supplier', 'supplierName phone');

    res.status(201).json({ success: true, data: populatedItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
const updateInventoryItem = async (req, res) => {
  try {
    const { itemName, category, quantity, unit, buyingPrice, sellingPrice, supplier, minimumStock } = req.body;

    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.itemName = itemName !== undefined ? itemName : item.itemName;
    item.category = category !== undefined ? category : item.category;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    item.unit = unit !== undefined ? unit : item.unit;
    item.buyingPrice = buyingPrice !== undefined ? buyingPrice : item.buyingPrice;
    item.sellingPrice = sellingPrice !== undefined ? sellingPrice : item.sellingPrice;
    item.supplier = supplier !== undefined ? supplier : item.supplier;
    item.minimumStock = minimumStock !== undefined ? minimumStock : item.minimumStock;

    await item.save();

    const updatedItem = await Inventory.findById(item._id)
      .populate('supplier', 'supplierName phone')
      .populate('createdBy', 'name');

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await Inventory.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private
const getLowStockAlerts = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).populate('supplier', 'supplierName phone');

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts
};
