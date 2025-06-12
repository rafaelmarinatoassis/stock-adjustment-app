import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const GestorRoute = () => {
  const role = localStorage.getItem('role');
  return role === 'Gestor' || role === 'Administrador' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default GestorRoute;