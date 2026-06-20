import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import ManajemenUser from '../pages/ManajemenUser/ManajemenUser';
import ManajemenGunung from '../pages/ManajemenGunung/ManajemenGunung';
import ManajemenJalur from '../pages/ManajemenJalur/ManajemenJalur';
import LaporanAktivitas from '../pages/LaporanAktivitas/LaporanAktivitas';

// Layout
import MainLayout from '../components/layout/MainLayout';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<ManajemenUser />} />
        <Route path="mountains" element={<ManajemenGunung />} />
        <Route path="trails" element={<ManajemenJalur />} />
        <Route path="reports" element={<LaporanAktivitas />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
