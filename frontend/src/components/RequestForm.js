import React, { useState } from 'react';
import axios from 'axios';

function RequestForm() {
  const [materialCode, setMaterialCode] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [justification, setJustification] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/requests', 
        { materialCode, materialDescription, quantity: parseInt(quantity), justification },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      // Clear form
      setMaterialCode('');
      setMaterialDescription('');
      setQuantity('');
      setJustification('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create request');
    }
  };

  return (
    <div>
      <h2>Create New Stock Adjustment Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Material Code (8 digits numeric):</label>
          <input type="text" value={materialCode} onChange={(e) => setMaterialCode(e.target.value)} maxLength="8" pattern="[0-9]{8}" required />
        </div>
        <div>
          <label>Material Description:</label>
          <input type="text" value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} required />
        </div>
        <div>
          <label>Quantity:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label>Justification:</label>
          <textarea value={justification} onChange={(e) => setJustification(e.target.value)} required />
        </div>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RequestForm;