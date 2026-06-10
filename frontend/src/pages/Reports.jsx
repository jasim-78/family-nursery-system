import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Leaf
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
  BarChart,
  Bar,
  Legend
} from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = '/api/dashboard/reports?';
      if (startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}&`;
      }
      const response = await axios.get(url);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [user]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-3xl">
        Access Denied. Only Administrators can view and export financial reports.
      </div>
    );
  }

  const statement = reportData?.profitLossSummary || {};
  const monthlyTimeline = reportData?.monthlyReportData || [];
  const salesCategory = reportData?.salesByCategory || [];

  const formatCurrency = (val) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val || 0);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-8 animate-fade-in print:bg-white print:p-0 print:space-y-4">
      {/* Top Header - Hidden in Print */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Reports & Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">Review detailed financial statements and item categories performance.</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-sm font-semibold transition-all-300 cursor-pointer self-start bg-white shadow-sm"
        >
          <Printer className="w-5 h-5 stroke-[1.8]" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Date Range Selector - Hidden in Print */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-4 print:hidden">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-600"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-600"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all-300 shadow-sm"
        >
          Generate Report
        </button>

        {startDate && endDate && (
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchReports, 0); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer mb-2.5"
          >
            Reset Dates
          </button>
        )}
      </form>

      {/* Report loading skeleton */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Generating reports and calculating balances...</p>
        </div>
      ) : (
        <>
          {/* Main Profit and Loss Sheet */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
            <div className="text-center pb-6 border-b border-slate-100 print:pb-4">
              <h3 className="text-xl font-bold text-slate-800 font-heading">Family Nursery Management</h3>
              <h4 className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Statement of Profit and Loss</h4>
              <p className="text-xs text-slate-400 mt-1">
                {startDate && endDate
                  ? `For the period from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                  : 'Cumulative Nursery Lifetime Ledger'}
              </p>
            </div>

            <div className="max-w-2xl mx-auto overflow-hidden border border-slate-100 rounded-2xl bg-slate-50/50 print:bg-transparent print:border-none">
              <table className="w-full text-sm font-medium text-slate-700">
                <tbody className="divide-y divide-slate-100">
                  {/* Revenue */}
                  <tr className="hover:bg-slate-50 transition-all-300">
                    <td className="px-6 py-4 text-slate-800 font-semibold">Total Revenue (Sales)</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(statement.totalRevenue)}</td>
                  </tr>
                  {/* COGS */}
                  <tr className="hover:bg-slate-50 transition-all-300">
                    <td className="px-6 py-4 pl-10 text-slate-500 font-medium">Cost of Goods Sold (Procurement Cost)</td>
                    <td className="px-6 py-4 text-right text-rose-500">({formatCurrency(statement.costOfGoodsSold)})</td>
                  </tr>
                  {/* Gross Profit */}
                  <tr className="bg-slate-100/50 hover:bg-slate-100 transition-all-300 font-bold border-y border-slate-200">
                    <td className="px-6 py-4 text-slate-800">Gross Profit</td>
                    <td className="px-6 py-4 text-right text-slate-800">{formatCurrency(statement.grossProfit)}</td>
                  </tr>
                  {/* Operating Expenses */}
                  <tr className="hover:bg-slate-50 transition-all-300">
                    <td className="px-6 py-4 pl-10 text-slate-500 font-medium">Operating Expenses (Utilities, Salaries, Rent)</td>
                    <td className="px-6 py-4 text-right text-rose-500">({formatCurrency(statement.operatingExpenses)})</td>
                  </tr>
                  {/* Plant Losses */}
                  <tr className="hover:bg-slate-50 transition-all-300">
                    <td className="px-6 py-4 pl-10 text-slate-500 font-medium">Plant & Stock Losses (Write-offs)</td>
                    <td className="px-6 py-4 text-right text-rose-500">({formatCurrency(statement.plantLossAmount)})</td>
                  </tr>
                  {/* Net Profit */}
                  <tr className={`hover:bg-slate-100 font-extrabold border-t border-slate-200 text-base ${
                    statement.netProfit >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    <td className="px-6 py-4 flex items-center space-x-1.5">
                      <span>Net Profit / (Loss)</span>
                      {statement.netProfit >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">{formatCurrency(statement.netProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row - Hidden in Print */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            {/* Sales vs Expenses Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 font-heading text-lg mb-6">Operations Timeline</h3>
              <div className="h-72">
                {monthlyTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        formatter={(val) => [formatCurrency(val), '']}
                      />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={0.1} fill="#10b981" />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={0.1} fill="#f59e0b" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No historical timelines found.
                  </div>
                )}
              </div>
            </div>

            {/* Sales by Category Pie Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 font-heading text-lg">Sales Revenue Share</h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribution across stock categories</p>
              </div>

              <div className="h-48 relative flex items-center justify-center">
                {salesCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {salesCategory.map((entry, index) => (
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
                    No sales recorded.
                  </div>
                )}
              </div>

              <div className="space-y-1 mt-4 max-h-32 overflow-y-auto px-2">
                {salesCategory.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-500 truncate max-w-28">{entry.name}</span>
                    </div>
                    <span className="text-slate-700">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
