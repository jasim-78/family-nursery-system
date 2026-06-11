import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, Trash2, X, Plus } from 'lucide-react';

const emptyItem = { itemId: '', quantitySold: 1, sellingPrice: 0 };

const Sales = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sales, setSales] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cartItems, setCartItems] = useState([{ ...emptyItem }]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales');
      if (response.data.success) setSales(response.data.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      if (response.data.success) setInventoryItems(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  const handleItemChange = (index, itemId) => {
    const selected = inventoryItems.find(i => i._id === itemId);
    const updated = [...cartItems];
    updated[index] = {
      itemId,
      quantitySold: 1,
      sellingPrice: selected?.sellingPrice || 0
    };
    setCartItems(updated);
  };

  const handleCartChange = (index, field, value) => {
    const updated = [...cartItems];
    updated[index] = { ...updated[index], [field]: value };
    setCartItems(updated);
  };

  const addCartRow = () => setCartItems([...cartItems, { ...emptyItem }]);

  const removeCartRow = (index) => {
    if (cartItems.length === 1) return;
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const grandTotal = cartItems.reduce((sum, row) => sum + (row.quantitySold * row.sellingPrice || 0), 0);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    for (const row of cartItems) {
      if (!row.itemId) { alert('Please select an item for all rows.'); return; }
      const stock = inventoryItems.find(i => i._id === row.itemId);
      if (stock && stock.quantity < row.quantitySold) {
        alert(`Insufficient stock for "${stock.itemName}". Only ${stock.quantity} ${stock.unit} available.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      // Submit each cart row as a separate sale
      await Promise.all(cartItems.map(row =>
        axios.post('/api/sales', { ...row, date })
      ));
      setShowAddModal(false);
      resetForm();
      fetchSales();
      fetchInventory();
      alert('Sale recorded successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (saleId) => {
    if (!window.confirm('Delete this sale record? Stock will be restored.')) return;
    try {
      const response = await axios.delete(`/api/sales/${saleId}`);
      if (response.data.success) {
        fetchSales();
        fetchInventory();
        alert('Sale deleted. Stock restored.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete sale.');
    }
  };

  const resetForm = () => {
    setCartItems([{ ...emptyItem }]);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const filteredSales = sales.filter(sale =>
    sale.itemId?.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Sales Management</h2>
          <p className="text-xs text-slate-400 mt-1">Record customer sales — add multiple items per transaction.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Sales Transaction</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search sales by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
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
            <table className="w-full text-left border-collapse mobile-table-card">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Item Sold</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Sold By</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/50 transition-all-300">
                    <td data-label="Date" className="px-6 py-4 text-slate-500">{new Date(sale.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td data-label="Item" className="px-6 py-4 font-semibold text-slate-800">{sale.itemId?.itemName || <span className="text-rose-500 italic">Deleted Item</span>}</td>
                    <td data-label="Qty" className="px-6 py-4">{sale.quantitySold} {sale.itemId?.unit || 'pcs'}</td>
                    <td data-label="Unit Price" className="px-6 py-4">₹{sale.sellingPrice.toFixed(2)}</td>
                    <td data-label="Total" className="px-6 py-4 text-emerald-600 font-bold">₹{sale.totalAmount.toFixed(2)}</td>
                    <td data-label="Sold By" className="px-6 py-4 text-slate-500">{sale.soldBy?.name || 'System'}</td>
                    {isAdmin && (
                      <td data-label="Actions" className="px-6 py-4">
                        <div className="flex">
                          <button onClick={() => handleDeleteClick(sale._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer">
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
            <p className="text-slate-400 text-sm">No sales records yet.</p>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800 font-heading">New Sales Transaction</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Transaction Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Items Purchased</label>

                {cartItems.map((row, index) => {
                  const stock = inventoryItems.find(i => i._id === row.itemId);
                  return (
                    <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Item {index + 1}</span>
                        {cartItems.length > 1 && (
                          <button type="button" onClick={() => removeCartRow(index)} className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Item Select */}
                      <select
                        required
                        value={row.itemId}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white cursor-pointer"
                      >
                        <option value="">-- Choose Item --</option>
                        {inventoryItems.map((item) => (
                          <option key={item._id} value={item._id} disabled={item.quantity <= 0}>
                            {item.itemName} ({item.category}) — {item.quantity} {item.unit} available
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={stock?.quantity || 9999}
                            required
                            value={row.quantitySold}
                            onChange={(e) => handleCartChange(index, 'quantitySold', parseInt(e.target.value, 10))}
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
                            value={row.sellingPrice}
                            onChange={(e) => handleCartChange(index, 'sellingPrice', parseFloat(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {row.itemId && (
                        <div className="text-right text-xs font-bold text-emerald-700">
                          Subtotal: ₹{(row.quantitySold * row.sellingPrice || 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Another Item Button */}
                <button
                  type="button"
                  onClick={addCartRow}
                  className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700 rounded-2xl text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Item</span>
                </button>
              </div>

              {/* Grand Total */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-emerald-800">
                <span className="text-sm font-bold">Grand Total ({cartItems.length} item{cartItems.length > 1 ? 's' : ''}):</span>
                <span className="text-xl font-extrabold font-heading">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer disabled:opacity-50">
                  {submitting ? 'Recording...' : 'Record Sale'}
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
