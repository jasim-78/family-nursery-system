const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const PlantLoss = require('../models/PlantLoss');
const ServiceReminder = require('../models/ServiceReminder');
const User = require('../models/User');

// Helper to get start and end dates
const getStartAndEndOfDay = (dateStr) => {
  const start = dateStr ? new Date(dateStr) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = dateStr ? new Date(dateStr) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getStartAndEndOfMonth = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard statistics cards
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const isClientAdmin = req.user.role === 'admin';

    // 1. Total Inventory Items & Available Stock
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableStock: { $sum: '$quantity' }
        }
      }
    ]);

    const totalItems = inventoryStats[0] ? inventoryStats[0].totalItems : 0;
    const availableStock = inventoryStats[0] ? inventoryStats[0].availableStock : 0;

    // 2. Low Stock Alerts
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    });

    // 3. Pending Service Reminders
    const pendingRemindersCount = await ServiceReminder.countDocuments({ status: 'pending' });

    // 4. Staff Count
    const staffCount = await User.countDocuments({ role: 'staff' });

    // Default object for common fields
    let stats = {
      totalItems,
      availableStock,
      lowStockAlerts: lowStockCount,
      pendingServiceReminders: pendingRemindersCount,
      staffCount
    };

    // If admin, add financial details
    if (isClientAdmin) {
      const today = getStartAndEndOfDay();
      const thisMonth = getStartAndEndOfMonth();

      // Today Income (sales)
      const todaySales = await Sale.aggregate([
        {
          $match: {
            date: { $gte: today.start, $lte: today.end }
          }
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$totalAmount' }
          }
        }
      ]);
      const todayIncome = todaySales[0] ? todaySales[0].totalIncome : 0;

      // Monthly Income (sales)
      const monthlySales = await Sale.aggregate([
        {
          $match: {
            date: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$totalAmount' }
          }
        }
      ]);
      const monthlyIncome = monthlySales[0] ? monthlySales[0].totalIncome : 0;

      // Monthly Expenses (General Expenses + Purchases)
      const generalExpenses = await Expense.aggregate([
        {
          $match: {
            date: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      const generalExpensesSum = generalExpenses[0] ? generalExpenses[0].total : 0;

      const purchaseExpenses = await Purchase.aggregate([
        {
          $match: {
            date: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      const purchaseExpensesSum = purchaseExpenses[0] ? purchaseExpenses[0].total : 0;

      const monthlyExpenses = generalExpensesSum + purchaseExpensesSum;

      // Plant Loss Amount (this month)
      const monthlyPlantLoss = await PlantLoss.aggregate([
        {
          $match: {
            date: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        {
          $group: {
            _id: null,
            totalLoss: { $sum: '$estimatedLossAmount' }
          }
        }
      ]);
      const plantLossAmount = monthlyPlantLoss[0] ? monthlyPlantLoss[0].totalLoss : 0;

      // Net Profit (Income - Expenses - Loss Amount, or just Income - Expenses depending on accounting definition)
      // Usually Profit = Income - Expenses (purchases are expenses. plant losses are a type of write-off, already accounted for in purchases or just added to expense)
      // Let's define Net Profit = Monthly Income - Monthly Expenses
      const netProfit = monthlyIncome - monthlyExpenses;

      stats = {
        ...stats,
        todayIncome,
        monthlyIncome,
        monthlyExpenses,
        netProfit,
        plantLossAmount
      };
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reports & analytics data (sales, expenses, categories)
// @route   GET /api/dashboard/reports
// @access  Private/Admin
const getReportsAndAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let queryDateRange = {};
    if (startDate && endDate) {
      queryDateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      queryDateRange = { $gte: sixMonthsAgo };
    }

    // 1. Monthly Sales vs Expenses Chart Data (grouped by month/year)
    const salesGroup = await Sale.aggregate([
      { $match: { date: queryDateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const expensesGroup = await Expense.aggregate([
      { $match: { date: queryDateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const purchasesGroup = await Purchase.aggregate([
      { $match: { date: queryDateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalPurchases: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lossesGroup = await PlantLoss.aggregate([
      { $match: { date: queryDateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalLosses: { $sum: '$estimatedLossAmount' }
        }
      }
    ]);

    // Map month outputs into a structured list of last 6 months (or custom range)
    // Create a continuous timeline map
    const timelineMap = {};

    const formatKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

    salesGroup.forEach(item => {
      const key = formatKey(item._id.year, item._id.month);
      if (!timelineMap[key]) timelineMap[key] = { month: key, sales: 0, expenses: 0, purchases: 0, losses: 0 };
      timelineMap[key].sales = item.totalSales;
    });

    expensesGroup.forEach(item => {
      const key = formatKey(item._id.year, item._id.month);
      if (!timelineMap[key]) timelineMap[key] = { month: key, sales: 0, expenses: 0, purchases: 0, losses: 0 };
      timelineMap[key].expenses += item.totalExpenses;
    });

    purchasesGroup.forEach(item => {
      const key = formatKey(item._id.year, item._id.month);
      if (!timelineMap[key]) timelineMap[key] = { month: key, sales: 0, expenses: 0, purchases: 0, losses: 0 };
      // purchases count as expense outlays
      timelineMap[key].purchases = item.totalPurchases;
      timelineMap[key].expenses += item.totalPurchases;
    });

    lossesGroup.forEach(item => {
      const key = formatKey(item._id.year, item._id.month);
      if (!timelineMap[key]) timelineMap[key] = { month: key, sales: 0, expenses: 0, purchases: 0, losses: 0 };
      timelineMap[key].losses = item.totalLosses;
    });

    // Sort the timeline
    const monthlyReportData = Object.values(timelineMap).sort((a, b) => a.month.localeCompare(b.month));

    // 2. Sales by Category
    const salesByCategory = await Sale.aggregate([
      { $match: { date: queryDateRange } },
      {
        $lookup: {
          from: 'inventories',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: '$item.category',
          value: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // 3. Profit / Loss Statement Summary
    // Total income in range
    const totalSalesSum = await Sale.aggregate([
      { $match: { date: queryDateRange } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesSum[0] ? totalSalesSum[0].total : 0;

    // Total buying price cost of goods sold (COGS)
    // Sum of quantitySold * item.buyingPrice
    const cogsSum = await Sale.aggregate([
      { $match: { date: queryDateRange } },
      {
        $lookup: {
          from: 'inventories',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: null,
          totalCOGS: { $sum: { $multiply: ['$quantitySold', '$item.buyingPrice'] } }
        }
      }
    ]);
    const cogs = cogsSum[0] ? cogsSum[0].totalCOGS : 0;

    // Operating expenses in range
    const operatingExpensesSum = await Expense.aggregate([
      { $match: { date: queryDateRange } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const operatingExpenses = operatingExpensesSum[0] ? operatingExpensesSum[0].total : 0;

    // Plant losses in range
    const plantLossSum = await PlantLoss.aggregate([
      { $match: { date: queryDateRange } },
      { $group: { _id: null, total: { $sum: '$estimatedLossAmount' } } }
    ]);
    const totalPlantLoss = plantLossSum[0] ? plantLossSum[0].total : 0;

    const netProfit = totalSales - cogs - operatingExpenses - totalPlantLoss;

    res.json({
      success: true,
      data: {
        monthlyReportData,
        salesByCategory,
        profitLossSummary: {
          totalRevenue: totalSales,
          costOfGoodsSold: cogs,
          grossProfit: totalSales - cogs,
          operatingExpenses,
          plantLossAmount: totalPlantLoss,
          netProfit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getReportsAndAnalytics
};
