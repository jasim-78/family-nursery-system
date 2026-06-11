import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Import Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import PlantLoss from './pages/PlantLoss';
import Staff from './pages/Staff';
import Attendance from './pages/Attendance';
import ServiceReminders from './pages/ServiceReminders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-8 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Admin Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout title="Nursery Overview Dashboard">
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Staff Dashboard */}
      <Route
        path="/staff-dashboard"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <Layout title="Staff floor Dashboard">
              <StaffDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Nursery Inventory Management">
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Sales */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Sales Logs & Transactions">
              <Sales />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Purchases (Admin Only) */}
      <Route
        path="/purchases"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout title="Purchases & Restock Ledger">
              <Purchases />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Suppliers */}
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Supplier contacts Directory">
              <Suppliers />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Expenses (Admin Only) */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout title="Expense Log Tracker">
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Plant Loss */}
      <Route
        path="/plant-losses"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Plant Loss & Damage Registry">
              <PlantLoss />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Staff roster (Admin Only) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout title="Staff directory">
              <Staff />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Attendance */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Attendance Shifts Tracker">
              <Attendance />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Service Reminders */}
      <Route
        path="/service-reminders"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="Service Reminders Bookings">
              <ServiceReminders />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Reports (Admin Only) */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout title="Reports & Financial Statements">
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout title="System & Profile Settings">
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to={user?.role === 'admin' ? '/' : '/staff-dashboard'} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
