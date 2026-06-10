const express = require('express');
const router = express.Router();
const { getPlantLosses, createPlantLoss, deletePlantLoss } = require('../controllers/plantLossController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getPlantLosses);
// Supports optional plant loss photo file upload
router.post('/', upload.single('photo'), createPlantLoss);
router.delete('/:id', authorize('admin'), deletePlantLoss);

module.exports = router;
