import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit3, Trash2, X, DollarSign, Calendar, FileText } from 'lucide-react';

const Expenses = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utility',
    amount: 0,
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Utility', 'Maintenance', 'Rent', 'Salaries', 'Supplies', 'Marketing', 'Logistics', 'Other'];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses');
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchExpenses();
    }
  }, [user]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/expenses', formData);
      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchExpenses();
        alert('Expense recorded successfully!');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to log expense.');
    }
  };

  const handleEditClick = (exp) => {
    setSelectedExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      note: exp.note || '',
      date: new Date(exp.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/expenses/${selectedExpense._id}`, formData);
      if (response.data.success) {
        setShowEditModal(false);
        resetForm();
        fetchExpenses();
        alert('Expense record updated!');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense.');
    }
  };

  const handleDeleteClick = (exp) => {
    setSelectedExpense(exp);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`/api/expenses/${selectedExpense._id}`);
      if (response.data.success) {
        setShowDeleteModal(false);
        fetchExpenses();
        alert('Expense record deleted.');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Utility',
      amount: 0,
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedExpense(null);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-3xl">
        Access Denied. Only Administrators can view and manage Expenses.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Expense Tracker</h2>
          <p className="text-xs text-slate-400 mt-1">Record and inspect general operating outlays and utility bills.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Record Expense Log</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading expense ledger...</p>
          </div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mobile-table-card">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Expense Date</th>
                  <th className="px-6 py-4">Expense Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4">Recorded By</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 transition-all-300">
                    <td data-label="Date" className="px-6 py-4 text-slate-500">
                      {new Date(exp.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td data-label="Title" className="px-6 py-4 font-semibold text-slate-800">{exp.title}</td>
                    <td data-label="Category" className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {exp.category}
                      </span>
                    </td>
                    <td data-label="Amount" className="px-6 py-4 text-rose-600 font-bold">₹{exp.amount.toFixed(2)}</td>
                    <td data-label="Notes" className="px-6 py-4 text-slate-500 max-w-48 truncate" title={exp.note}>{exp.note || '-'}</td>
                    <td data-label="By" className="px-6 py-4 text-slate-500">{exp.addedBy?.name || 'System'}</td>
                    <td data-label="Actions" className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(exp)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(exp)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm">No expenses logged yet.</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Record Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric bill greenhouse A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Provide details of payment, payment method, etc."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold cursor-pointer transition-all-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 cursor-pointer transition-all-300"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Edit Expense</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Notes</label>
                <textarea
                  rows="3"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold cursor-pointer transition-all-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 cursor-pointer transition-all-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-heading">Delete Expense Record?</h3>
                <p className="text-xs text-slate-400 mt-1">Are you sure you want to remove <span className="font-bold text-slate-700">{selectedExpense?.title}</span>? This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-all-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
