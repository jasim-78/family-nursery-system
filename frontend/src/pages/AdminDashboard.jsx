import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Leaf,
  DollarSign,
  AlertTriangle,
  Users,
  BellRing,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CalendarDays
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await axios.get('/api/dashboard/stats');
        const reportsRes = await axios.get('/api/dashboard/reports');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (reportsRes.data.success) {
          setReports(reportsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-nursery-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  // Format currency helpers
  const formatCurrency = (val) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val || 0);
  };

  // Recharts colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];

  const salesCategoryData = reports?.salesByCategory || [];
  const monthlyTimelineData = reports?.monthlyReportData || [];

  const cards = [
    {
      title: 'Total Inventory Items',
      value: stats?.totalItems,
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Available Stock',
      value: stats?.availableStock,
      icon: TrendingUp,
      color: 'bg-teal-50 text-teal-700 border-teal-100',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockAlerts,
      icon: AlertTriangle,
      color: stats?.lowStockAlerts > 0 ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-100',
    },
    {
      title: "Today's Income",
      value: formatCurrency(stats?.todayIncome),
      icon: DollarSign,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(stats?.monthlyIncome),
      icon: DollarSign,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats?.monthlyExpenses),
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats?.netProfit),
      icon: DollarSign,
      color: stats?.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100',
    },
    {
      title: 'Plant Loss Amount',
      value: formatCurrency(stats?.plantLossAmount),
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      title: 'Pending Reminders',
      value: stats?.pendingServiceReminders,
      icon: BellRing,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      title: 'Staff Members',
      value: stats?.staffCount,
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-forest-900 to-nursery-700 p-6 rounded-3xl text-white shadow-xl shadow-nursery-950/10">
        <div>
          <h2 className="text-2xl font-bold font-heading">Lush Greenhouse Overview</h2>
          <p className="text-emerald-100/90 text-sm mt-1 font-medium">Here is the latest financial and operational status of your Family Nursery.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center space-x-2 border border-white/10">
          <CalendarDays className="w-5 h-5" />
          <span className="text-sm font-semibold">{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${card.color} flex flex-col justify-between shadow-sm bg-white`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{card.title}</span>
              <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0">
                <card.icon className="w-5 h-5 stroke-[1.6]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-800 tracking-tight font-heading">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Expenses Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 font-heading text-lg">Financial Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue vs expenses (outlays + purchases)</p>
            </div>
            <div className="flex space-x-3 text-xs font-medium">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Sales</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-500">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-80">
            {monthlyTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [formatCurrency(val), '']}
                  />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No financial logs found in current range.
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 font-heading text-lg">Sales by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of nursery sales revenue</p>
          </div>

          <div className="h-60 relative flex items-center justify-center">
            {salesCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {salesCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [formatCurrency(val), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No sales data recorded.
              </div>
            )}
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto px-2">
            {salesCategoryData.map((entry, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-500 truncate max-w-28">{entry.name}</span>
                </div>
                <span className="text-slate-700">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
