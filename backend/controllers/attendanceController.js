const Attendance = require('../models/Attendance');

// @desc    Get all attendance records (with filters)
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { staffId, date, month, year } = req.query;
    let query = {};

    if (staffId) {
      query.staffId = staffId;
    }

    if (date) {
      // Parse specific date (YYYY-MM-DD)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (month && year) {
      // Parse month (1-12) and year (e.g. 2026)
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const records = await Attendance.find(query)
      .populate('staffId', 'name email role')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark/Update attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const { staffId, date, status } = req.body;

    // Resolve which user we are marking attendance for
    // Staff can only mark their own attendance, admin can mark for any staff
    const targetStaffId = req.user.role === 'admin' ? (staffId || req.user._id) : req.user._id;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    // Set date to midnight of that day to avoid duplicate records on same calendar day
    const recordDate = date ? new Date(date) : new Date();
    recordDate.setHours(0, 0, 0, 0);

    // Find and update or create
    const record = await Attendance.findOneAndUpdate(
      { staffId: targetStaffId, date: recordDate },
      { status: status },
      { new: true, upsert: true, runValidators: true }
    ).populate('staffId', 'name email role');

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAttendance,
  markAttendance
};
