import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Clock, CheckCircle, AlertCircle, CalendarDays, Filter } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mark Form State
  const [markData, setMarkData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let url = `/api/attendance?month=${selectedMonth}&year=${selectedYear}&`;

      if (selectedStaffId) {
        url += `staffId=${selectedStaffId}&`;
      } else if (!isAdmin) {
        // Staff can only view their own attendance
        url += `staffId=${user._id}&`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
      console.error('Error loading staff list:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedStaffId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [user]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const payload = {
      status: markData.status,
      date: markData.date
    };

    if (isAdmin) {
      if (!markData.staffId) {
        alert('Please select a staff member.');
        return;
      }
      payload.staffId = markData.staffId;
    } else {
      payload.staffId = user._id;
    }

    try {
      const response = await axios.post('/api/attendance', payload);
      if (response.data.success) {
        alert('Attendance successfully logged!');
        fetchAttendance();
        setMarkData({
          ...markData,
          staffId: '',
          status: 'present'
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to log attendance record.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 font-heading">Attendance Sheets</h2>
        <p className="text-xs text-slate-400 mt-1">
          {isAdmin ? 'Monitor greenhouse floor staff shift check-in logs.' : 'View your work check-in logs and log today\'s attendance.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Attendance Marker Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm self-start">
          <h3 className="font-bold text-slate-800 font-heading text-lg mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Mark Attendance</span>
          </h3>

          <form onSubmit={handleMarkAttendance} className="space-y-4">
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Staff Member</label>
                <select
                  required
                  value={markData.staffId}
                  onChange={(e) => setMarkData({ ...markData, staffId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Shift Date</label>
              <input
                type="date"
                required
                value={markData.date}
                onChange={(e) => setMarkData({ ...markData, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={markData.status}
                onChange={(e) => setMarkData({ ...markData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="present">Present (Full Day)</option>
                <option value="half-day">Half-Day Shift</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all-300 shadow-sm shadow-emerald-900/10 cursor-pointer"
            >
              Log Check-In
            </button>
          </form>
        </div>

        {/* Right Side: Attendance Logs & Filter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter Logs:</span>
            </div>

            {isAdmin && (
              <div className="shrink-0 min-w-44">
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 cursor-pointer bg-white"
                >
                  <option value="">All Staff Members</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="shrink-0 min-w-36">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 cursor-pointer bg-white"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="shrink-0 min-w-28">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 cursor-pointer bg-white"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Loading logs...</p>
              </div>
            ) : records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Calendar Date</th>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                    {records.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/50 transition-all-300">
                        <td className="px-6 py-4 text-slate-500 flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          <span>{new Date(rec.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{rec.staffId?.name || 'Deleted Account'}</td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-slate-400 font-semibold text-xs">{rec.staffId?.role || 'staff'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              rec.status === 'half-day' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {rec.status === 'present' && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                              {rec.status === 'half-day' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                              <span className="capitalize">{rec.status}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-slate-400 text-sm">No attendance records found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
