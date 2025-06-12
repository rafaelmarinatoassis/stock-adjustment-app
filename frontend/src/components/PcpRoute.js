import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PcpRoute = () => {
  const role = localStorage.getItem('role');
  return role === 'PCP' || role === 'Administrador' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default PcpRoute;