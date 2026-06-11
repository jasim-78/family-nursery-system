import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  PlusCircle,
  Trash2,
  X,
  ShoppingCart
} from 'lucide-react';

const Purchases = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [purchases, setPurchases] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    itemId: '',
    quantityPurchased: 1,
    buyingPrice: 0,
    supplierId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/purchases');
      if (response.data.success) {
        setPurchases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryAndSuppliers = async () => {
    try {
      const invRes = await axios.get('/api/inventory');
      if (invRes.data.success) {
        setInventoryItems(invRes.data.data);
      }

      const supRes = await axios.get('/api/suppliers');
      if (supRes.data.success) {
        setSuppliers(supRes.data.data);
      }
    } catch (error) {
      console.error('Error loading config for purchases:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPurchases();
      fetchInventoryAndSuppliers();
    }
  }, [user]);

  const handleItemChange = (itemId) => {
    const selected = inventoryItems.find(item => item._id === itemId);
    if (selected) {
      setFormData({
        ...formData,
        itemId: itemId,
        buyingPrice: selected.buyingPrice,
        supplierId: selected.supplier?._id || selected.supplier || ''
      });
    } else {
      setFormData({
        ...formData,
        itemId: '',
        buyingPrice: 0,
        supplierId: ''
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      alert('Please select an item to purchase.');
      return;
    }

    try {
      const response = await axios.post('/api/purchases', formData);
      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchPurchases();
        fetchInventoryAndSuppliers();
        alert('Procurement purchase logged successfully!');
      }
    } catch (error) {
      console.error('Error logging purchase:', error);
      alert(error.response?.data?.message || 'Failed to record purchase.');
    }
  };

  const handleDeleteClick = async (purchaseId) => {
    if (!window.confirm('Are you sure you want to delete this purchase record? Reverting stock will subtract the purchased quantities.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/purchases/${purchaseId}`);
      if (response.data.success) {
        fetchPurchases();
        fetchInventoryAndSuppliers();
        alert('Purchase record deleted. Stock reverted.');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert(error.response?.data?.message || 'Failed to delete purchase.');
    }
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      quantityPurchased: 1,
      buyingPrice: 0,
      supplierId: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredPurchases = purchases.filter(p => {
    return p.itemId?.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-3xl">
        Access Denied. Only Administrators can view and manage Purchases.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Purchase & Restocking Management</h2>
          <p className="text-xs text-slate-400 mt-1">Record and inspect restock procurements from suppliers.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Record Purchase Restock</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search restocks by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all-300"
          />
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading purchases ledger...</p>
          </div>
        ) : filteredPurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mobile-table-card">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Restock Date</th>
                  <th className="px-6 py-4">Item Restocked</th>
                  <th className="px-6 py-4">Quantity Added</th>
                  <th className="px-6 py-4">Unit Buying Cost</th>
                  <th className="px-6 py-4">Total Expenses</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-50/50 transition-all-300">
                    <td data-label="Date" className="px-6 py-4 text-slate-500">
                      {new Date(purchase.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td data-label="Item" className="px-6 py-4 font-semibold text-slate-800">
                      {purchase.itemId?.itemName || <span className="text-rose-500 italic">Deleted Item</span>}
                    </td>
                    <td data-label="Qty" className="px-6 py-4">
                      {purchase.quantityPurchased} {purchase.itemId?.unit || 'pcs'}
                    </td>
                    <td data-label="Unit Cost" className="px-6 py-4">₹{purchase.buyingPrice.toFixed(2)}</td>
                    <td data-label="Total" className="px-6 py-4 text-rose-600 font-bold">₹{purchase.totalAmount.toFixed(2)}</td>
                    <td data-label="Supplier" className="px-6 py-4 text-slate-500">{purchase.supplierId?.supplierName || 'N/A'}</td>
                    <td data-label="Actions" className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDeleteClick(purchase._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer"
                          title="Delete Record / Subtract Stock"
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
            <p className="text-slate-400 text-sm">No restock records logged yet.</p>
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Record Procurement</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Item to Restock</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.itemName} ({item.category}) - {item.quantity} {item.unit} currently
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity Restocked</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantityPurchased}
                    onChange={(e) => setFormData({ ...formData, quantityPurchased: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Buying Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier</label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((sup) => (
                    <option key={sup._id} value={sup._id}>{sup.supplierName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Restock Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formData.itemId && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center text-rose-800">
                  <span className="text-xs font-bold">Estimated Cost:</span>
                  <span className="text-lg font-extrabold font-heading">
                    ₹{(formData.quantityPurchased * formData.buyingPrice || 0).toFixed(2)}
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
                  Record Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
