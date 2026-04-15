import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerLayout from './components/CustomerLayout';
import Home from './pages/customer/Home';
import TripDetails from './pages/customer/TripDetails';
import Checkout from './pages/customer/Checkout';
import MyBookings from './pages/customer/MyBookings';

import Dashboard from './pages/Dashboard';
import ManageBuses from './pages/ManageBuses';
import ManageTrips from './pages/ManageTrips';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import { useAuth } from './context/AuthContext';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Customer Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="trip/:id" element={<TripDetails />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="my-bookings" element={<MyBookings />} />
      </Route>
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="buses" element={<ManageBuses />} />
        <Route path="trips" element={<ManageTrips />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
      </Route>


      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
