import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, ShieldCheck, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingReminders, setPendingReminders] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const stockRes = await axios.get('/api/inventory/alerts/low-stock');
        if (stockRes.data.success) {
          setLowStockCount(stockRes.data.count);
        }

        const reminderRes = await axios.get('/api/service-reminders?status=pending');
        if (reminderRes.data.success) {
          setPendingReminders(reminderRes.data.count);
        }
      } catch (error) {
        console.error('Error fetching notifications for Navbar:', error);
      }
    };

    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm shadow-slate-100/40">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-heading">{title || 'Nursery Admin'}</h2>
      </div>

      {/* Action Indicators */}
      <div className="flex items-center space-x-6">
        {/* Low Stock Notification Pill */}
        {lowStockCount > 0 && (
          <Link
            to={user?.role === 'admin' ? '/inventory?lowStock=true' : '/inventory'}
            className="flex items-center space-x-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-full text-xs font-semibold text-amber-700 transition-all-300 animate-pulse"
            title={`${lowStockCount} items are running low on stock!`}
          >
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2]" />
            <span>{lowStockCount} Low Stock</span>
          </Link>
        )}

        {/* Pending Service Reminders Pill */}
        {pendingReminders > 0 && (
          <Link
            to="/service-reminders"
            className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-full text-xs font-semibold text-emerald-700 transition-all-300"
            title={`${pendingReminders} service reminders pending!`}
          >
            <Bell className="w-3.5 h-3.5 stroke-[2]" />
            <span>{pendingReminders} Bookings</span>
          </Link>
        )}

        {/* Vertical Separator */}
        <span className="w-px h-6 bg-slate-200" />

        {/* User Card */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize font-medium">{user?.role} Access</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 font-semibold text-slate-600 font-heading">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {user?.role === 'admin' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Verified Admin">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
