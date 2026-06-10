import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Leaf,
  DollarSign,
  ShoppingCart,
  Truck,
  CreditCard,
  AlertTriangle,
  Users,
  CalendarCheck,
  BellRing,
  BarChart3,
  Settings,
  LogOut,
  Flower2
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define links based on roles
  const adminLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Leaf },
    { to: '/sales', label: 'Sales Ledger', icon: DollarSign },
    { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
    { to: '/suppliers', label: 'Suppliers', icon: Truck },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
    { to: '/plant-losses', label: 'Plant Losses', icon: AlertTriangle },
    { to: '/staff', label: 'Staff Roster', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/service-reminders', label: 'Service Reminders', icon: BellRing },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const staffLinks = [
    { to: '/staff-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'View Inventory', icon: Leaf },
    { to: '/sales', label: 'Add Sales', icon: DollarSign },
    { to: '/plant-losses', label: 'Add Plant Loss', icon: AlertTriangle },
    { to: '/service-reminders', label: 'Service Reminders', icon: BellRing },
    { to: '/attendance', label: 'Mark Attendance', icon: CalendarCheck },
  ];

  const links = user?.role === 'admin' ? adminLinks : staffLinks;

  return (
    <div className="w-64 bg-forest-950 text-slate-100 flex flex-col h-screen fixed left-0 top-0 sidebar-shadow z-20">
      {/* Brand Logo */}
      <div className="p-6 border-b border-forest-900 flex items-center space-x-3 bg-gradient-to-r from-forest-950 to-nursery-950">
        <Flower2 className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white font-heading leading-tight">Family Nursery</h1>
          <span className="text-xs text-emerald-400/80 font-medium tracking-wide">MANAGEMENT SYSTEM</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/' || link.to === '/staff-dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all-300 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 translate-x-1'
                  : 'text-slate-300 hover:bg-forest-900 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5 stroke-[1.8]" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Session Info */}
      <div className="p-4 border-t border-forest-900 bg-nursery-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-heading shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-emerald-400 capitalize font-medium">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all-300 ml-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
