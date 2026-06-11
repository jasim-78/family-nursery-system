import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Calendar, Phone, CheckCircle, XCircle, Clock, X, User, Trash2 } from 'lucide-react';

const ServiceReminders = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [reminders, setReminders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    serviceType: 'Landscaping',
    reminderDate: '',
    reminderTime: '10:00 AM',
    address: '',
    notes: '',
    assignedTo: ''
  });

  const serviceTypes = ['Landscaping', 'Repotting Help', 'Pest Control spray', 'Watering Service', 'Lawn Mowing', 'Soil aeration', 'Other'];

  const fetchReminders = async () => {
    try {
      setLoading(true);
      let url = '/api/service-reminders?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (!isAdmin) {
        // Option: staff can see their own reminders or all.
        // Let's filter to their ID if not admin for a cleaner floor view, but let's allow seeing others if they want.
        // The instructions say: "Staff permissions: View reminders, Mark reminders completed".
        // Let's allow staff to see all but highlight which are assigned to them, or let them filter.
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setReminders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/staff');
      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [statusFilter]);

  useEffect(() => {
    fetchStaff();
  }, [user]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.assignedTo) {
        delete payload.assignedTo;
      }
      const response = await axios.post('/api/service-reminders', payload);
      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchReminders();
        alert('Service booking recorded!');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to log reminder.');
    }
  };

  const handleStatusChange = async (reminderId, newStatus) => {
    try {
      const response = await axios.put(`/api/service-reminders/${reminderId}`, {
        status: newStatus
      });
      if (response.data.success) {
        fetchReminders();
        alert(`Booking updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleDeleteClick = async (reminderId) => {
    if (!window.confirm('Delete this service reminder booking?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/service-reminders/${reminderId}`);
      if (response.data.success) {
        fetchReminders();
        alert('Booking removed.');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder.');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      serviceType: 'Landscaping',
      reminderDate: '',
      reminderTime: '10:00 AM',
      address: '',
      notes: '',
      assignedTo: ''
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Service Bookings & Reminders</h2>
          <p className="text-xs text-slate-400 mt-1">Manage lawn care, repotting, and landscaping service requests.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-semibold transition-all-300 shadow-lg shadow-emerald-900/10 cursor-pointer self-start"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Service Booking</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide shrink-0">Status:</span>
          <div className="flex flex-wrap gap-2">
            {['', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all-300 cursor-pointer ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {status === '' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading bookings list...</p>
          </div>
        ) : reminders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mobile-table-card">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Service Schedule</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Service Type</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Assigned Staff</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {reminders.map((rem) => {
                  const isAssignedToMe = rem.assignedTo?._id === user._id;
                  return (
                    <tr key={rem._id} className={`hover:bg-slate-50/50 transition-all-300 ${isAssignedToMe && rem.status === 'pending' ? 'bg-emerald-50/25 pulse-border-alert' : ''}`}>
                      <td data-label="Schedule" className="px-6 py-4 text-slate-500">
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(rem.reminderDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{rem.reminderTime || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Customer" className="px-6 py-4">
                        <p className="font-semibold text-slate-800 leading-tight">{rem.customerName}</p>
                        <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{rem.phoneNumber}</span>
                        </div>
                      </td>
                      <td data-label="Service" className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                          {rem.serviceType}
                        </span>
                      </td>
                      <td data-label="Address" className="px-6 py-4 text-slate-500 max-w-48 truncate" title={rem.address}>{rem.address || '-'}</td>
                      <td data-label="Assigned" className="px-6 py-4">
                        <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{rem.assignedTo?.name || 'Unassigned'}</span>
                        </span>
                      </td>
                      <td data-label="Status" className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          rem.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          rem.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {rem.status}
                        </span>
                      </td>
                      <td data-label="Actions" className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {rem.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(rem._id, 'completed')}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-all-300 cursor-pointer"
                                title="Mark Completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(rem._id, 'cancelled')}
                                className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg transition-all-300 cursor-pointer"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteClick(rem._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all-300 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm">No service bookings found matching filter.</p>
          </div>
        )}
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 font-heading">New Service Booking</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-200 transition-all-300 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {serviceTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Employee</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    required
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 128 Maple Lane, WA"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Special Instruction Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Provide details about gates, tree limbs, tools needed, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
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
                  Book Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceReminders;
