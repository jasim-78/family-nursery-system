import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Leaf,
  TrendingUp,
  AlertTriangle,
  BellRing,
  Users,
  CalendarCheck,
  PlusCircle,
  ClipboardList,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [markedStatus, setMarkedStatus] = useState('');
  const [myReminders, setMyReminders] = useState([]);

  const fetchStaffDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get('/api/dashboard/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch reminders assigned to this staff member
      const remindersRes = await axios.get(`/api/service-reminders?status=pending&assignedTo=${user._id}`);
      if (remindersRes.data.success) {
        setMyReminders(remindersRes.data.data);
      }

      // Check if attendance is marked for today
      const todayStr = new Date().toISOString().split('T')[0];
      const attendanceRes = await axios.get(`/api/attendance?staffId=${user._id}&date=${todayStr}`);
      if (attendanceRes.data.success && attendanceRes.data.data.length > 0) {
        setAttendanceMarked(true);
        setMarkedStatus(attendanceRes.data.data[0].status);
      } else {
        setAttendanceMarked(false);
        setMarkedStatus('');
      }
    } catch (error) {
      console.error('Error loading staff dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStaffDashboardData();
    }
  }, [user]);

  const handleMarkAttendance = async (status) => {
    try {
      const response = await axios.post('/api/attendance', {
        staffId: user._id,
        status: status
      });
      if (response.data.success) {
        setAttendanceMarked(true);
        setMarkedStatus(status);
        alert(`Attendance marked successfully as ${status}!`);
        fetchStaffDashboardData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance.');
    }
  };

  const handleCompleteReminder = async (id) => {
    try {
      const response = await axios.put(`/api/service-reminders/${id}`, {
        status: 'completed'
      });
      if (response.data.success) {
        alert('Service booking completed!');
        fetchStaffDashboardData();
      }
    } catch (error) {
      console.error('Error updating reminder status:', error);
      alert('Failed to complete reminder.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-nursery-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Inventory Items', value: stats?.totalItems, icon: Leaf, color: 'bg-emerald-50 text-emerald-700' },
    { title: 'Available Stock', value: stats?.availableStock, icon: TrendingUp, color: 'bg-teal-50 text-teal-700' },
    { title: 'Low Stock Alerts', value: stats?.lowStockAlerts, icon: AlertTriangle, color: stats?.lowStockAlerts > 0 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-slate-50 text-slate-700' },
    { title: 'Pending Reminders', value: stats?.pendingServiceReminders, icon: BellRing, color: 'bg-purple-50 text-purple-700' },
    { title: 'Staff Roster Count', value: stats?.staffCount, icon: Users, color: 'bg-blue-50 text-blue-700' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-nursery-700 to-emerald-600 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-2xl font-bold font-heading">Welcome back, {user?.name}</h2>
          <p className="text-emerald-50/90 text-sm mt-1 font-medium">Have a wonderful day taking care of the plants and supporting our customers!</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center space-x-2 border border-white/10">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-semibold">{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border border-slate-100 ${card.color} flex flex-col justify-between shadow-sm bg-white`}>
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

      {/* Attendance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Marker */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 font-heading text-lg flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <span>Daily Attendance Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Log your check-in status for today.</p>
          </div>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            {attendanceMarked ? (
              <div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 mb-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="capitalize">Marked: {markedStatus}</span>
                </span>
                <p className="text-xs text-slate-500 font-medium">Your attendance has been recorded for today. Thank you!</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-4">Please log your shift attendance status:</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => handleMarkAttendance('present')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-900/10 cursor-pointer transition-all-300"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('half-day')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-semibold shadow-sm shadow-amber-900/10 cursor-pointer transition-all-300"
                  >
                    Half Day
                  </button>
                </div>
              </div>
            )}
          </div>
          <Link to="/attendance" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline text-center">
            View attendance log history
          </Link>
        </div>

        {/* Floor Quick Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 font-heading text-lg flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <span>Nursery Floor Actions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Perform quick nursery floor operations.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <Link
              to="/sales"
              className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100/50 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-emerald-800 transition-all-300 shadow-sm"
            >
              <PlusCircle className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold font-heading">Record Sale</span>
            </Link>

            <Link
              to="/plant-losses"
              className="p-4 bg-rose-50 hover:bg-rose-100/80 border border-rose-100/50 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-rose-800 transition-all-300 shadow-sm"
            >
              <PlusCircle className="w-6 h-6 text-rose-600" />
              <span className="text-xs font-bold font-heading">Report Loss</span>
            </Link>
          </div>

          <Link to="/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline text-center">
            Search & inspect greenhouse inventory
          </Link>
        </div>

        {/* Assigned Service Reminders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 font-heading text-lg flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-emerald-600" />
              <span>My Tasks ({myReminders.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Service bookings assigned to you.</p>
          </div>

          <div className="my-6 overflow-y-auto max-h-48 space-y-3 px-1">
            {myReminders.length > 0 ? (
              myReminders.map((reminder) => (
                <div key={reminder._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 truncate">{reminder.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{reminder.serviceType}</p>
                    <p className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">
                      {new Date(reminder.reminderDate).toLocaleDateString()} {reminder.reminderTime}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteReminder(reminder._id)}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all-300 cursor-pointer shrink-0"
                    title="Mark Completed"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                You have no pending service bookings today.
              </div>
            )}
          </div>

          <Link to="/service-reminders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline text-center">
            View all nursery service bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
