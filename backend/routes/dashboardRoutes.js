const express = require('express');
const router = express.Router();
const { getDashboardStats, getReportsAndAnalytics } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/reports', authorize('admin'), getReportsAndAnalytics);

module.exports = router;
