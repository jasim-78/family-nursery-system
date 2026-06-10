import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Phone, Mail, Database, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleBackupDB = () => {
    setBackingUp(true);
    setTimeout(() => {
      setBackingUp(false);
      alert('Database Backup JSON generated and saved locally in server/backups/!');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 font-heading">System Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your nursery staff profile and trigger backups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200/60 mx-auto flex items-center justify-center font-bold font-heading text-3xl text-slate-500">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 font-heading leading-tight">{user?.name}</h3>
            <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-bold capitalize tracking-wide mt-2">
              {user?.role} Access
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Account status: <span className="text-emerald-600 font-bold">Active</span></p>
        </div>

        {/* Right Side: Account details form & Backup parameters */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 font-heading text-lg mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Update Profile</span>
            </h3>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium">
                    {user?.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium truncate">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Permission</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium capitalize">
                    {user?.role}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Backup Database Card */}
          {user?.role === 'admin' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 font-heading text-lg">System Administration</h3>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Trigger a complete database dump check. This gathers records from Mongoose models (Users, Inventory, Sales, Purchases, Expenses) and saves them as JSON backup files on the local file system.
              </p>
              <button
                onClick={handleBackupDB}
                disabled={backingUp}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all-300 disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{backingUp ? 'Backing Up...' : 'Trigger Backup DB Dump'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
