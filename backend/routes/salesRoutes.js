const express = require('express');
const router = express.Router();
const { getSales, createSale, deleteSale } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getSales);
router.post('/', createSale); // Both admin and staff can add sales
router.delete('/:id', authorize('admin'), deleteSale); // Only admin can delete/revert sales

module.exports = router;
