const express = require('express');
const router = express.Router();
const {
  getServiceReminders,
  createServiceReminder,
  updateServiceReminder,
  deleteServiceReminder
} = require('../controllers/serviceReminderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getServiceReminders);
router.post('/', createServiceReminder);
router.put('/:id', updateServiceReminder);
router.delete('/:id', authorize('admin'), deleteServiceReminder); // Only admin can delete reminders

module.exports = router;
