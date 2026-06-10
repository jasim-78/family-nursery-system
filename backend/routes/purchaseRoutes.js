const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase, deletePurchase } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // All purchase routes are Admin only

router.get('/', getPurchases);
router.post('/', createPurchase);
router.delete('/:id', deletePurchase);

module.exports = router;
