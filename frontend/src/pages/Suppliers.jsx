import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit3, Trash2, X, Phone, MapPin, Truck } from 'lucide-react';

const Suppliers = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    supplierName: '',
    phone: '',
    address: '',
    suppliedItemsString: ''
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers');
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const suppliedItems = formData.suppliedItemsString
      ? formData.suppliedItemsString.split(',').map(item => item.trim())
      : [];

    try {
      const response = await axios.post('/api/suppliers', {
        ...formData,
        suppliedItems
      });
      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchSuppliers();
        alert('Supplier added successfully!');
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier.');
    }
  };

  const handleEditClick = (sup) => {
    setSelectedSupplier(sup);
    setFormData({
      supplierName: sup.supplierName,
      phone: sup.phone || '',
      address: sup.address || '',
      suppliedItemsString: sup.suppliedItems ? sup.suppliedItems.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const suppliedItems = formData.suppliedItemsString
      ? formData.suppliedItemsString.split(',').map(item => item.trim())
      : [];

    try {
      const response = await axios.put(`/api/suppliers/${selectedSupplier._id}`, {
        ...formData,
        suppliedItems
      });
      if (response.data.success) {
        setShowEditModal(false);
        resetForm();
        fetchSuppliers();
        alert('Supplier details updated!');
      }
    } catch (error) {
      console.error('Error editing supplier:', error);
      alert('Failed to update supplier.');
    }
  };

  const handleDeleteClick = (sup) => {
    setSelectedSupplier(sup);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`/api/suppliers/${selectedSupplier._id}`);
      if (response.data.success) {
        setShowDeleteModal(false);
        fetchSuppliers();
        alert('Supplier removed.');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier.');
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      phone: '',
      address: '',
      suppliedItemsString: ''
    });
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Supplier Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage contacts and restock logistics profiles.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Supplier Profile</span>
          </button>
        )}
      </div>

      {/* Supplier Grid List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading supplier list...</p>
        </div>
      ) : suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <div key={sup._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all-300">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl">
                      <Truck className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 font-heading leading-tight">{sup.supplierName}</h3>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditClick(sup)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-all-300 cursor-pointer"
                        title="Edit Supplier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sup)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-all-300 cursor-pointer"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{sup.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="leading-normal">{sup.address || 'No address recorded'}</span>
                  </div>
                </div>
              </div>

              {/* Supplied categories */}
              <div className="mt-6 pt-4 border-t border-slate-50">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">SUPPLIED CATEGORIES</span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.suppliedItems && sup.suppliedItems.length > 0 ? (
                    sup.suppliedItems.map((item, i) => (
                      <span key={i} className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic font-medium">No items cataloged</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-400 text-sm">No suppliers added yet.</p>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Add Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplied Categories</label>
                <input
                  type="text"
                  placeholder="Plants, Soil Bags, Fertilizers, etc. (comma separated)"
                  value={formData.suppliedItemsString}
                  onChange={(e) => setFormData({ ...formData, suppliedItemsString: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-semibold">
                  Provide categories separated by a comma (e.g., Seeds, Pots).
                </span>
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
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Edit Supplier</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplied Categories</label>
                <input
                  type="text"
                  value={formData.suppliedItemsString}
                  onChange={(e) => setFormData({ ...formData, suppliedItemsString: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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

      {/* Delete Supplier Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-heading">Delete Supplier Profile?</h3>
                <p className="text-xs text-slate-400 mt-1">Are you sure you want to remove <span className="font-bold text-slate-700">{selectedSupplier?.supplierName}</span>? This action cannot be undone.</p>
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

export default Suppliers;
