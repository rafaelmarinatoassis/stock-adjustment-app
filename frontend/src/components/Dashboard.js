import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {message && <p>{message}</p>}
      <div className="dashboard-summary">
        <div className="dashboard-card">
          <h3>Total Pending</h3>
          <p>{dashboardData.totalPending}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Approved</h3>
          <p>{dashboardData.totalApproved}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Completed</h3>
          <p>{dashboardData.totalCompleted}</p>
        </div>
      </div>
      {/* Add more dashboard elements as needed */}
    </div>
  );
}

export default Dashboard;