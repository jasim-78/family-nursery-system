import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, X, Image as ImageIcon, Eye, AlertTriangle } from 'lucide-react';

const PlantLoss = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [losses, setLosses] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    itemId: '',
    quantityLost: 1,
    reason: '',
    lossType: 'Dead',
    date: new Date().toISOString().split('T')[0]
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const fetchLosses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/plant-losses');
      if (response.data.success) {
        setLosses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching plant losses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      if (response.data.success) {
        // filter inventory items to those of the 'Plants' category or just all items since pots/covers can also get damaged.
        // The request says "Plant Loss Management", so we can list plants. Or we can list all inventory items in case clay pots break.
        // Let's list all items so staff can log pots or soil bag damage, but prioritize plants.
        setInventoryItems(response.data.data);
      }
    } catch (error) {
      console.error('Error loading inventory for loss logging:', error);
    }
  };

  useEffect(() => {
    fetchLosses();
    fetchInventory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      alert('Please select an item.');
      return;
    }

    const selectedItem = inventoryItems.find(item => item._id === formData.itemId);
    if (selectedItem && selectedItem.quantity < formData.quantityLost) {
      alert(`Invalid loss quantity. Only ${selectedItem.quantity} units exist in inventory.`);
      return;
    }

    try {
      const data = new FormData();
      data.append('itemId', formData.itemId);
      data.append('quantityLost', formData.quantityLost);
      data.append('reason', formData.reason);
      data.append('lossType', formData.lossType);
      data.append('date', formData.date);
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const response = await axios.post('/api/plant-losses', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchLosses();
        fetchInventory(); // refresh stock numbers
        alert('Plant loss logged and stock adjusted.');
      }
    } catch (error) {
      console.error('Error saving plant loss:', error);
      alert(error.response?.data?.message || 'Failed to record plant loss.');
    }
  };

  const handleDeleteClick = async (lossId) => {
    if (!window.confirm('Are you sure you want to delete this loss record? Doing so will restore the lost quantities back to inventory.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/plant-losses/${lossId}`);
      if (response.data.success) {
        fetchLosses();
        fetchInventory(); // refresh stock numbers
        alert('Plant loss record deleted. Stock restored.');
      }
    } catch (error) {
      console.error('Error deleting plant loss:', error);
      alert('Failed to delete loss record.');
    }
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      quantityLost: 1,
      reason: '',
      lossType: 'Dead',
      date: new Date().toISOString().split('T')[0]
    });
    setPhotoFile(null);
    setPhotoPreviewUrl('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Plant Loss Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Log damaged, dead, or missing inventory stock.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-rose-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report Crop/Stock Loss</span>
        </button>
      </div>

      {/* Plant Loss Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading loss reports...</p>
          </div>
        ) : losses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mobile-table-card">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Report Date</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Quantity Lost</th>
                  <th className="px-6 py-4">Loss Type</th>
                  <th className="px-6 py-4">Estimated Loss ($)</th>
                  <th className="px-6 py-4">Photo Proof</th>
                  <th className="px-6 py-4">Logged By</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {losses.map((loss) => (
                  <tr key={loss._id} className="hover:bg-slate-50/50 transition-all-300">
                    <td data-label="Date" className="px-6 py-4 text-slate-500">
                      {new Date(loss.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td data-label="Item" className="px-6 py-4 font-semibold text-slate-800">
                      {loss.itemId?.itemName || <span className="text-rose-500 italic">Deleted Item</span>}
                    </td>
                    <td data-label="Qty Lost" className="px-6 py-4">
                      {loss.quantityLost} {loss.itemId?.unit || 'pcs'}
                    </td>
                    <td data-label="Loss Type" className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        loss.lossType === 'Dead' ? 'bg-slate-100 text-slate-700' :
                        loss.lossType === 'Damaged' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        loss.lossType === 'Diseased' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        loss.lossType === 'Stolen' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {loss.lossType}
                      </span>
                    </td>
                    <td data-label="Loss Amt" className="px-6 py-4 text-rose-600 font-bold">₹{loss.estimatedLossAmount.toFixed(2)}</td>
                    <td data-label="Photo" className="px-6 py-4">
                      {loss.photoUrl ? (
                        <button
                          onClick={() => setPreviewImage(`${loss.photoUrl}`)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-bold text-slate-600 transition-all-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-medium">None</span>
                      )}
                    </td>
                    <td data-label="Logged By" className="px-6 py-4 text-slate-500">{loss.addedBy?.name || 'System'}</td>
                    {isAdmin && (
                      <td data-label="Actions" className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleDeleteClick(loss._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all-300 cursor-pointer"
                            title="Delete Loss / Restore Stock"
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
            <p className="text-slate-400 text-sm">No plant losses logged yet.</p>
          </div>
        )}
      </div>

      {/* Add Loss Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">Log Plant / Stock Loss</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Lost Item</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id} disabled={item.quantity <= 0}>
                      {item.itemName} - {item.quantity} {item.unit} in stock{isAdmin ? ` (Buying: ₹${item.buyingPrice.toFixed(2)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity Lost</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantityLost}
                    onChange={(e) => setFormData({ ...formData, quantityLost: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loss Type</label>
                  <select
                    value={formData.lossType}
                    onChange={(e) => setFormData({ ...formData, lossType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Dead">Dead (Root rot, dry)</option>
                    <option value="Damaged">Damaged (Broken, split)</option>
                    <option value="Diseased">Diseased (Infected)</option>
                    <option value="Stolen">Stolen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Report Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason / Explanation</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Frost damage overnight, pest infestation..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Photo Proof</label>
                <div className="mt-1 flex items-center space-x-3">
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 transition-all-300">
                    Choose Photo File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-48">
                    {photoFile ? photoFile.name : 'No image attached'}
                  </span>
                </div>
                {photoPreviewUrl && (
                  <div className="mt-3 relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <img src={photoPreviewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreviewUrl(''); }}
                      className="absolute top-1 right-1 p-0.5 bg-slate-900/60 text-white rounded-md hover:bg-slate-900 transition-all-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-950/10 cursor-pointer transition-all-300"
                >
                  Report Loss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Loss proof high res" className="max-w-full max-h-[80vh] rounded-3xl object-contain border border-white/10 shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-all-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantLoss;
