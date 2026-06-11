import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, ShieldCheck } from 'lucide-react';
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
        if (stockRes.data.success) setLowStockCount(stockRes.data.count);
        const reminderRes = await axios.get('/api/service-reminders?status=pending');
        if (reminderRes.data.success) setPendingReminders(reminderRes.data.count);
      } catch (error) {
        console.error('Navbar fetch error:', error);
      }
    };
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 fixed top-0 right-0 left-0 lg:left-64 z-10 shadow-sm">

      {/* Left: Title with space for hamburger on mobile */}
      <div className="ml-12 lg:ml-0 min-w-0 flex-1">
        <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight font-heading truncate">
          {title || 'Nursery Admin'}
        </h2>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center space-x-2 md:space-x-4 shrink-0">

        {/* Low Stock — icon only on mobile, full pill on desktop */}
        {lowStockCount > 0 && (
          <Link
            to={user?.role === 'admin' ? '/inventory?lowStock=true' : '/inventory'}
            className="flex items-center space-x-1 px-2 md:px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-full text-xs font-semibold text-amber-700 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2] shrink-0" />
            <span className="hidden md:inline">{lowStockCount} Low Stock</span>
            <span className="md:hidden">{lowStockCount}</span>
          </Link>
        )}

        {/* Pending Reminders — icon only on mobile */}
        {pendingReminders > 0 && (
          <Link
            to="/service-reminders"
            className="flex items-center space-x-1 px-2 md:px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-full text-xs font-semibold text-emerald-700"
          >
            <Bell className="w-3.5 h-3.5 stroke-[2] shrink-0" />
            <span className="hidden md:inline">{pendingReminders} Bookings</span>
            <span className="md:hidden">{pendingReminders}</span>
          </Link>
        )}

        {/* Divider */}
        <span className="w-px h-6 bg-slate-200 hidden md:block" />

        {/* User Card */}
        <div className="flex items-center space-x-2">
          {/* Name + role — hidden on small mobile */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize font-medium">{user?.role} Access</p>
          </div>
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 font-semibold text-slate-600 font-heading text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {user?.role === 'admin' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <ShieldCheck className="w-2 h-2 text-white" />
              </span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
