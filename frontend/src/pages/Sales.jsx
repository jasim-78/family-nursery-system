import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  PlusCircle,
  TrendingUp,
  Trash2,
  Calendar,
  X,
  Plus
} from 'lucide-react';

const Sales = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sales, setSales] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    itemId: '',
    quantitySold: 1,
    sellingPrice: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedItemStock, setSelectedItemStock] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales');
      if (response.data.success) {
        setSales(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      if (response.data.success) {
        setInventoryItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory for sales:', error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  const handleItemChange = (itemId) => {
    const selected = inventoryItems.find(item => item._id === itemId);
    if (selected) {
      setSelectedItemStock(selected);
      setFormData({
        ...formData,
        itemId: itemId,
        sellingPrice: selected.sellingPrice
      });
    } else {
      setSelectedItemStock(null);
      setFormData({
        ...formData,
        itemId: '',
        sellingPrice: 0
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      alert('Please select an item.');
      return;
    }

    if (selectedItemStock && selectedItemStock.quantity < formData.quantitySold) {
      alert(`Insufficient stock. Only ${selectedItemStock.quantity} ${selectedItemStock.unit} available.`);
      return;
    }

    try {
      const response = await axios.post('/api/sales', formData);
      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchSales();
        fetchInventory(); // refresh stock numbers
        alert('Sale recorded successfully!');
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      alert(error.response?.data?.message || 'Failed to record sale.');
    }
  };

  const handleDeleteClick = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale record? Doing so will restore the quantity back to inventory.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/sales/${saleId}`);
      if (response.data.success) {
        fetchSales();
        fetchInventory(); // refresh stock numbers
        alert('Sale record deleted. Stock restored.');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert(error.response?.data?.message || 'Failed to delete sale.');
    }
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      quantitySold: 1,
      sellingPrice: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedItemStock(null);
  };

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => {
    return sale.itemId?.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Sales Management</h2>
          <p className="text-xs text-slate-400 mt-1">Record and inspect customer sales transactions.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Sales Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search sales by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all-300"
          />
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading transactions...</p>
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Item Sold</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Sold By</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/50 transition-all-300">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sale.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {sale.itemId?.itemName || <span className="text-rose-500 italic">Deleted Item</span>}
                    </td>
                    <td className="px-6 py-4">
                      {sale.quantitySold} {sale.itemId?.unit || 'pcs'}
                    </td>
                    <td className="px-6 py-4">₹{sale.sellingPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">₹{sale.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500">{sale.soldBy?.name || 'System'}</td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => handleDeleteClick(sale._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer"
                            title="Delete Sale / Revert Stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm">No sales records logged yet.</p>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Record Sale</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Item</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id} disabled={item.quantity <= 0}>
                      {item.itemName} ({item.category}) - {item.quantity} {item.unit} available
                    </option>
                  ))}
                </select>
                {selectedItemStock && (
                  <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                    Category: {selectedItemStock.category} | Current Stock: {selectedItemStock.quantity} {selectedItemStock.unit}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity Sold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantitySold}
                    onChange={(e) => setFormData({ ...formData, quantitySold: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {formData.itemId && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-emerald-800">
                  <span className="text-xs font-bold">Estimated Total:</span>
                  <span className="text-lg font-extrabold font-heading">
                    ₹{(formData.quantitySold * formData.sellingPrice || 0).toFixed(2)}
                  </span>
                </div>
              )}

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
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
