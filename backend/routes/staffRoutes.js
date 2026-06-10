const express = require('express');
const router = express.Router();
const {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // All staff management routes are Admin only

router.get('/', getStaffMembers);
router.post('/', createStaffMember);
router.put('/:id', updateStaffMember);
router.delete('/:id', deleteStaffMember);

module.exports = router;
