import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const userRole = localStorage.getItem('role');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;

      const response = await axios.get('http://localhost:5000/requests', {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });
      setRequests(response.data.requests);
      setTotal(response.data.total);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, limit, statusFilter, startDateFilter, endDateFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/requests/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      fetchRequests(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update status');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2>Stock Adjustment Requests</h2>
      {message && <p>{message}</p>}

      <div>
        <h3>Filters</h3>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Não Validado">Não Validado</option>
          <option value="Aprovado pelo Gestor">Aprovado pelo Gestor</option>
          <option value="Concluído">Concluído</option>
        </select>
        <label>Start Date:</label>
        <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
        <label>End Date:</label>
        <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Material Code</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Justification</th>
            <th>Status</th>
            <th>Requester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.materialCode}</td>
              <td>{request.materialDescription}</td>
              <td>{request.quantity}</td>
              <td>{request.justification}</td>
              <td>{request.status}</td>
              <td>{request.requesterFirstName} {request.requesterLastName}</td>
              <td>
                {userRole === 'Gestor' && request.status === 'Não Validado' && (
                  <>
                    <button onClick={() => handleStatusUpdate(request.id, 'Aprovado pelo Gestor')}>Approve</button>
                    <button onClick={() => handleStatusUpdate(request.id, 'Reprovado')}>Reprove</button>
                  </>
                )}
                {userRole === 'PCP' && request.status === 'Aprovado pelo Gestor' && (
                  <button onClick={() => handleStatusUpdate(request.id, 'Concluído')}>Mark as Concluído</button>
                )}
                {userRole === 'Administrador' && (
                  <select onChange={(e) => handleStatusUpdate(request.id, e.target.value)} value={request.status}>
                    <option value="Não Validado">Não Validado</option>
                    <option value="Aprovado pelo Gestor">Aprovado pelo Gestor</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default RequestList;