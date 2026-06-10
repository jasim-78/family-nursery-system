const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create expense (admin only)
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
  try {
    const { title, category, amount, note, date } = req.body;

    const expense = await Expense.create({
      title,
      category,
      amount,
      note,
      addedBy: req.user._id,
      date: date || Date.now()
    });

    const populatedExpense = await Expense.findById(expense._id).populate('addedBy', 'name');

    res.status(201).json({ success: true, data: populatedExpense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update expense (admin only)
// @route   PUT /api/expenses/:id
// @access  Private/Admin
const updateExpense = async (req, res) => {
  try {
    const { title, category, amount, note, date } = req.body;

    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    expense.title = title !== undefined ? title : expense.title;
    expense.category = category !== undefined ? category : expense.category;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.note = note !== undefined ? note : expense.note;
    expense.date = date !== undefined ? date : expense.date;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id).populate('addedBy', 'name');

    res.json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete expense (admin only)
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Expense record removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
