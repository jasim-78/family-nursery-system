const ServiceReminder = require('../models/ServiceReminder');

// @desc    Get all service reminders
// @route   GET /api/service-reminders
// @access  Private
const getServiceReminders = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Staff should see reminders assigned to them, or all reminders if not specified
    if (req.user.role === 'staff' && !assignedTo && status === 'pending') {
      // By default, staff could view all pending or filter by their ID
      // Let's support both
    }

    const reminders = await ServiceReminder.find(query)
      .populate('assignedTo', 'name phone')
      .sort({ reminderDate: 1 });

    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create service reminder
// @route   POST /api/service-reminders
// @access  Private
const createServiceReminder = async (req, res) => {
  try {
    const { customerName, phoneNumber, serviceType, reminderDate, reminderTime, address, notes, assignedTo } = req.body;

    const reminder = await ServiceReminder.create({
      customerName,
      phoneNumber,
      serviceType,
      reminderDate,
      reminderTime,
      address,
      notes,
      assignedTo: assignedTo || null,
      status: 'pending'
    });

    const populatedReminder = await ServiceReminder.findById(reminder._id)
      .populate('assignedTo', 'name phone');

    res.status(201).json({ success: true, data: populatedReminder });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update service reminder details
// @route   PUT /api/service-reminders/:id
// @access  Private
const updateServiceReminder = async (req, res) => {
  try {
    const { customerName, phoneNumber, serviceType, reminderDate, reminderTime, address, notes, status, assignedTo } = req.body;

    let reminder = await ServiceReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Service reminder not found' });
    }

    // Role checks: Staff can mark reminders completed/cancelled, but shouldn't edit customer details.
    if (req.user.role === 'staff') {
      // Only allow updating status and notes
      reminder.status = status !== undefined ? status : reminder.status;
      reminder.notes = notes !== undefined ? notes : reminder.notes;
    } else {
      // Admin can update everything
      reminder.customerName = customerName !== undefined ? customerName : reminder.customerName;
      reminder.phoneNumber = phoneNumber !== undefined ? phoneNumber : reminder.phoneNumber;
      reminder.serviceType = serviceType !== undefined ? serviceType : reminder.serviceType;
      reminder.reminderDate = reminderDate !== undefined ? reminderDate : reminder.reminderDate;
      reminder.reminderTime = reminderTime !== undefined ? reminderTime : reminder.reminderTime;
      reminder.address = address !== undefined ? address : reminder.address;
      reminder.notes = notes !== undefined ? notes : reminder.notes;
      reminder.status = status !== undefined ? status : reminder.status;
      reminder.assignedTo = assignedTo !== undefined ? assignedTo : reminder.assignedTo;
    }

    await reminder.save();

    const updatedReminder = await ServiceReminder.findById(reminder._id)
      .populate('assignedTo', 'name phone');

    res.json({ success: true, data: updatedReminder });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete service reminder (Admin only)
// @route   DELETE /api/service-reminders/:id
// @access  Private/Admin
const deleteServiceReminder = async (req, res) => {
  try {
    const reminder = await ServiceReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Service reminder not found' });
    }

    await ServiceReminder.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Service reminder removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getServiceReminders,
  createServiceReminder,
  updateServiceReminder,
  deleteServiceReminder
};
