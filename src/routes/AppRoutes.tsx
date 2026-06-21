import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register'; // Meskipun dihapus dari UI, route tetap dijaga
import Dashboard from '../pages/Dashboard/Dashboard';
import ManajemenUser from '../pages/ManajemenUser/ManajemenUser';
import ManajemenGunung from '../pages/ManajemenGunung/ManajemenGunung';
import ManajemenJalur from '../pages/ManajemenJalur/ManajemenJalur';
import LaporanAktivitas from '../pages/LaporanAktivitas/LaporanAktivitas';

// Layout
import MainLayout from '../components/layout/MainLayout';

// =========================================================
// 1. Private Route Guard (Hanya untuk yang SUDAH login)
// =========================================================
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Kita cek keberadaan token di localStorage (setelah Login.tsx memperbaikinya)
  const token = localStorage.getItem('token');
  
  // Jika tidak ada token, paksa user kembali ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Jika ada token, izinkan akses ke halaman tersebut
  return <>{children}</>;
};

// =========================================================
// 2. Public Route Guard (Hanya untuk yang BELUM login)
// =========================================================
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Jika user SUDAH login tapi coba akses /login, tendang ke /dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Jika belum login, silakan lihat halaman login
  return <>{children}</>;
};

// =========================================================
// Konfigurasi Utama AppRoutes
// =========================================================
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Bungkus halaman publik dengan PublicRoute */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Bungkus Layout utama (halaman dalam) */}
      <Route path="/" element={<MainLayout />}>
        {/* Ubah index agar langsung mengarah ke dashboard jika ada token */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Bungkus semua halaman internal dengan PrivateRoute */}
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="users" element={<PrivateRoute><ManajemenUser /></PrivateRoute>} />
        <Route path="mountains" element={<PrivateRoute><ManajemenGunung /></PrivateRoute>} />
        <Route path="trails" element={<PrivateRoute><ManajemenJalur /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute><LaporanAktivitas /></PrivateRoute>} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;