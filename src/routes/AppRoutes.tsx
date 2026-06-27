import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ManajemenUser from '../pages/ManajemenUser/ManajemenUser';
import ManajemenGunung from '../pages/ManajemenGunung/ManajemenGunung';
import ManajemenJalur from '../pages/ManajemenJalur/ManajemenJalur';
import LaporanAktivitas from '../pages/LaporanAktivitas/LaporanAktivitas';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Context
import { useAuth } from '../context/AuthContext';

// =========================================================
// 1. Private Route Guard (Hanya untuk yang SUDAH login)
// =========================================================
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Jika tidak ada user, paksa kembali ke halaman login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// =========================================================
// 2. Public Route Guard (Hanya untuk yang BELUM login)
// =========================================================
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Jika user SUDAH login tapi coba akses /login, tendang ke /dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// =========================================================
// Konfigurasi Utama AppRoutes
// =========================================================
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      {/* Bungkus Layout utama pada route /dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<ManajemenUser />} />
        <Route path="mountains" element={<ManajemenGunung />} />
        <Route path="trails" element={<ManajemenJalur />} />
        <Route path="reports" element={<LaporanAktivitas />} />
      </Route>
      
      {/* Fallback & Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;