import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RequestForm from './components/RequestForm';
import RequestList from './components/RequestList';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import GestorRoute from './components/GestorRoute';
import PcpRoute from './components/PcpRoute';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/requests/new">New Request</Link>
            </li>
            <li>
              <Link to="/requests">View Requests</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/requests/new" element={<RequestForm />} />
            <Route path="/requests" element={<RequestList />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Specific routes for roles */}
          <Route element={<AdminRoute />}>
            {/* Admin specific routes here, if any beyond general private routes */}
          </Route>
          <Route element={<GestorRoute />}>
            {/* Gestor specific routes here */}
          </Route>
          <Route element={<PcpRoute />}>
            {/* PCP specific routes here */}
          </Route>

          <Route path="/" element={<Login />} /> {/* Default route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;