const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All inventory routes require login

router.get('/', getInventory);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/:id', getInventoryItemById);

// Admin only operations
router.post('/', authorize('admin'), createInventoryItem);
router.put('/:id', authorize('admin'), updateInventoryItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

module.exports = router;
