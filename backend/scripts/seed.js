const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const PlantLoss = require('../models/PlantLoss');
const Attendance = require('../models/Attendance');
const ServiceReminder = require('../models/ServiceReminder');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nursery';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    // Clear existing collections
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Inventory.deleteMany({});
    await Sale.deleteMany({});
    await Purchase.deleteMany({});
    await Expense.deleteMany({});
    await PlantLoss.deleteMany({});
    await Attendance.deleteMany({});
    await ServiceReminder.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Nursery Manager Admin',
      email: 'admin@nursery.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      phone: '+1 (555) 123-4567',
      status: 'active'
    });

    const staff = await User.create({
      name: 'Nursery Assistant Staff',
      email: 'staff@nursery.com',
      password: 'staff123', // Will be hashed by pre-save hook
      role: 'staff',
      phone: '+1 (555) 987-6543',
      status: 'active'
    });
    console.log('Users created successfully.');

    // 2. Create Suppliers
    console.log('Creating suppliers...');
    const sup1 = await Supplier.create({
      supplierName: 'Green Valley Flora',
      phone: '+1 (800) 555-0199',
      address: '45 Orchard Dr, Salem, OR',
      suppliedItems: ['Plants', 'Seeds']
    });

    const sup2 = await Supplier.create({
      supplierName: 'Clay & Plastic Pots Corp',
      phone: '+1 (800) 555-0244',
      address: '109 Industrial Pkwy, Tacoma, WA',
      suppliedItems: ['Pots']
    });

    const sup3 = await Supplier.create({
      supplierName: 'Eco-Grow Fertilizer & Soil Co',
      phone: '+1 (800) 555-0131',
      address: '77 Organic Rd, Modesto, CA',
      suppliedItems: ['Fertilizers', 'Soil Bags', 'Cocopeat', 'Manure', 'Pesticides']
    });
    console.log('Suppliers created.');

    // 3. Create Inventory Items
    console.log('Creating inventory...');
    const items = [
      {
        itemName: 'Monstera Deliciosa (Medium)',
        category: 'Plants',
        quantity: 45,
        unit: 'pcs',
        buyingPrice: 12.00,
        sellingPrice: 35.00,
        supplier: sup1._id,
        minimumStock: 8,
        createdBy: admin._id,
      },
      {
        itemName: 'Snake Plant (Sansevieria)',
        category: 'Plants',
        quantity: 60,
        unit: 'pcs',
        buyingPrice: 8.00,
        sellingPrice: 22.00,
        supplier: sup1._id,
        minimumStock: 10,
        createdBy: admin._id,
      },
      {
        itemName: 'Terracotta Pot (8-inch)',
        category: 'Pots',
        quantity: 120,
        unit: 'pcs',
        buyingPrice: 1.50,
        sellingPrice: 4.99,
        supplier: sup2._id,
        minimumStock: 25,
        createdBy: admin._id,
      },
      {
        itemName: 'Premium Organic Fertilizer',
        category: 'Fertilizers',
        quantity: 35,
        unit: 'packet',
        buyingPrice: 4.50,
        sellingPrice: 12.50,
        supplier: sup3._id,
        minimumStock: 5,
        createdBy: admin._id,
      },
      {
        itemName: 'All-Purpose Potting Soil',
        category: 'Soil Bags',
        quantity: 5, // Low stock on purpose
        unit: 'bag',
        buyingPrice: 3.00,
        sellingPrice: 8.99,
        supplier: sup3._id,
        minimumStock: 10,
        createdBy: admin._id,
      },
      {
        itemName: 'Organic Neem Oil Pesticide',
        category: 'Pesticides',
        quantity: 2, // Low stock on purpose
        unit: 'pcs',
        buyingPrice: 6.50,
        sellingPrice: 15.00,
        supplier: sup3._id,
        minimumStock: 5,
        createdBy: admin._id,
      },
      {
        itemName: 'Compressed Cocopeat Brick',
        category: 'Cocopeat',
        quantity: 80,
        unit: 'pcs',
        buyingPrice: 2.00,
        sellingPrice: 6.00,
        supplier: sup3._id,
        minimumStock: 15,
        createdBy: admin._id,
      },
      {
        itemName: 'Dehydrated Cow Manure',
        category: 'Manure',
        quantity: 40,
        unit: 'bag',
        buyingPrice: 2.50,
        sellingPrice: 7.50,
        supplier: sup3._id,
        minimumStock: 8,
        createdBy: admin._id,
      },
      {
        itemName: 'Bonsai Repotting Tool Set',
        category: 'Gardening Tools',
        quantity: 15,
        unit: 'pcs',
        buyingPrice: 7.00,
        sellingPrice: 19.99,
        supplier: sup2._id,
        minimumStock: 3,
        createdBy: admin._id,
      }
    ];

    const seededItems = await Inventory.create(items);
    console.log('Inventory seeded.');

    // 4. Seed Sales
    console.log('Seeding sales...');
    const saleDate1 = new Date();
    saleDate1.setHours(11, 0, 0, 0);

    const saleDate2 = new Date();
    saleDate2.setDate(saleDate2.getDate() - 3); // 3 days ago

    const saleDate3 = new Date();
    saleDate3.setDate(saleDate3.getDate() - 15); // 15 days ago

    const sales = [
      {
        itemId: seededItems[0]._id, // Monstera
        quantitySold: 4,
        sellingPrice: 35.00,
        totalAmount: 140.00,
        soldBy: staff._id,
        date: saleDate1 // Today
      },
      {
        itemId: seededItems[2]._id, // Terracotta Pot
        quantitySold: 10,
        sellingPrice: 4.99,
        totalAmount: 49.90,
        soldBy: staff._id,
        date: saleDate1 // Today
      },
      {
        itemId: seededItems[1]._id, // Snake Plant
        quantitySold: 6,
        sellingPrice: 22.00,
        totalAmount: 132.00,
        soldBy: admin._id,
        date: saleDate2 // 3 days ago
      },
      {
        itemId: seededItems[3]._id, // Premium Fertilizer
        quantitySold: 5,
        sellingPrice: 12.50,
        totalAmount: 62.50,
        soldBy: staff._id,
        date: saleDate3 // 15 days ago
      }
    ];
    await Sale.create(sales);
    console.log('Sales seeded.');

    // 5. Seed Purchases
    console.log('Seeding purchases...');
    const purchaseDate = new Date();
    purchaseDate.setDate(purchaseDate.getDate() - 12); // 12 days ago

    const purchases = [
      {
        itemId: seededItems[0]._id, // Monstera
        quantityPurchased: 20,
        buyingPrice: 12.00,
        totalAmount: 240.00,
        supplierId: sup1._id,
        date: purchaseDate
      },
      {
        itemId: seededItems[4]._id, // Soil Bag
        quantityPurchased: 15,
        buyingPrice: 3.00,
        totalAmount: 45.00,
        supplierId: sup3._id,
        date: purchaseDate
      }
    ];
    await Purchase.create(purchases);
    console.log('Purchases seeded.');

    // 6. Seed Expenses
    console.log('Seeding expenses...');
    const expDate1 = new Date();
    expDate1.setDate(expDate1.getDate() - 5);
    const expDate2 = new Date();
    expDate2.setDate(expDate2.getDate() - 20);

    const expenses = [
      {
        title: 'Electricity Bill - Greenhouses',
        category: 'Utility',
        amount: 145.00,
        note: 'Power consumption for automated water misting and grow lights.',
        addedBy: admin._id,
        date: expDate1
      },
      {
        title: 'Office Stationary and Soil Tester Repair',
        category: 'Maintenance',
        amount: 65.50,
        note: 'Printer ink, receipts roll, and local repair of calibration kit.',
        addedBy: admin._id,
        date: expDate2
      }
    ];
    await Expense.create(expenses);
    console.log('Expenses seeded.');

    // 7. Seed Plant Loss
    console.log('Seeding plant losses...');
    const lossDate = new Date();
    lossDate.setDate(lossDate.getDate() - 2);

    const losses = [
      {
        itemId: seededItems[0]._id, // Monstera
        quantityLost: 2,
        reason: 'Overwatered by weekend staff, root rot occurred.',
        lossType: 'Dead',
        estimatedLossAmount: 24.00, // 2 * buying price (12.00)
        photoUrl: '', // empty url for mock
        addedBy: staff._id,
        date: lossDate
      },
      {
        itemId: seededItems[1]._id, // Snake Plant
        quantityLost: 1,
        reason: 'Knocked over and broken beyond salvage by delivery truck.',
        lossType: 'Damaged',
        estimatedLossAmount: 8.00, // 1 * buying price (8.00)
        photoUrl: '',
        addedBy: admin._id,
        date: lossDate
      }
    ];
    await PlantLoss.create(losses);
    console.log('Plant losses seeded.');

    // 8. Seed Attendance
    console.log('Seeding attendance...');
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const attendanceRecords = [];
    dates.forEach(d => {
      attendanceRecords.push({
        staffId: staff._id,
        date: d,
        status: i => i === 2 ? 'half-day' : 'present' // mock attendance statuses
      });
    });

    // Generate different values manually for safety
    await Attendance.create([
      { staffId: staff._id, date: dates[0], status: 'present' },
      { staffId: staff._id, date: dates[1], status: 'present' },
      { staffId: staff._id, date: dates[2], status: 'half-day' },
      { staffId: staff._id, date: dates[3], status: 'present' },
      { staffId: staff._id, date: dates[4], status: 'absent' }
    ]);
    console.log('Attendance seeded.');

    // 9. Seed Service Reminders
    console.log('Seeding service reminders...');
    const remDate1 = new Date();
    remDate1.setDate(remDate1.getDate() + 2); // 2 days later

    const remDate2 = new Date();
    remDate2.setDate(remDate2.getDate() + 5); // 5 days later

    const reminders = [
      {
        customerName: 'Robert Johnson',
        phoneNumber: '+1 (555) 303-4902',
        serviceType: 'Lawn Mowing & Aeration',
        reminderDate: remDate1,
        reminderTime: '09:30 AM',
        address: '891 Pine Tree Way, Seattle, WA',
        notes: 'Needs backyard aeration and tree limb trimming. Green bin is on left.',
        status: 'pending',
        assignedTo: staff._id
      },
      {
        customerName: 'Clara Oswald',
        phoneNumber: '+1 (555) 707-1122',
        serviceType: 'Repotting Service',
        reminderDate: remDate2,
        reminderTime: '02:00 PM',
        address: '56 Baker St, London, WA',
        notes: 'Bring 4 bags of premium potting soil and terracotta pots. Client requested help repotting indoor palms.',
        status: 'pending',
        assignedTo: staff._id
      },
      {
        customerName: 'David Tennant',
        phoneNumber: '+1 (555) 909-8833',
        serviceType: 'Gardening Consult',
        reminderDate: new Date(), // Today
        reminderTime: '10:00 AM',
        address: '10 Tardis Lane, Seattle, WA',
        notes: 'Consultation on installing drip-irrigation layout.',
        status: 'completed',
        assignedTo: admin._id
      }
    ];
    await ServiceReminder.create(reminders);
    console.log('Service reminders seeded.');

    console.log('Database Seeding Completed Successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDB();
