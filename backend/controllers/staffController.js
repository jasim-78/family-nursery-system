const User = require('../models/User');

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private/Admin
const getStaffMembers = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ name: 1 });
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new staff member
// @route   POST /api/staff
// @access  Private/Admin
const createStaffMember = async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: 'staff',
      phone,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        status: staff.status
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaffMember = async (req, res) => {
  try {
    const { name, email, phone, status, password } = req.body;

    let staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    staff.name = name !== undefined ? name : staff.name;
    staff.phone = phone !== undefined ? phone : staff.phone;
    staff.status = status !== undefined ? status : staff.status;

    if (email && email !== staff.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      staff.email = email;
    }

    if (password) {
      staff.password = password; // Trigger pre-save hook
    }

    await staff.save();

    res.json({
      success: true,
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        status: staff.status
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaffMember = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Instead of deleting, we could set inactive, but standard is CRUD delete
    await User.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Staff member profile deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
};
