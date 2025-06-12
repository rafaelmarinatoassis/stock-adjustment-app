const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'your_jwt_secret_key'; // Use a strong, unique key in production

app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./stock_adjustment.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materialCode TEXT NOT NULL,
      materialDescription TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      justification TEXT NOT NULL,
      status TEXT NOT NULL,
      requesterId INTEGER,
      approverId INTEGER,
      pcpId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requesterId) REFERENCES users(id)
    )`);

    // Add a default admin user if not exists
    const adminEmail = 'admin@example.com';
    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }
      if (!row) {
        bcrypt.hash('adminpassword', 10, (err, hash) => {
          if (err) {
            console.error('Error hashing admin password:', err.message);
            return;
          }
          db.run(`INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)`, 
            ['Admin', 'User', adminEmail, hash, 'Administrador'], (err) => {
              if (err) {
                console.error('Error inserting admin user:', err.message);
              } else {
                console.log('Default admin user created.');
              }
            });
        });
      }
    });
  }
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)`, 
      [firstName, lastName, email, hashedPassword, role], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  });
});

// Create a new request (Solicitante)
app.post('/requests', authenticateToken, (req, res) => {
  if (req.user.role !== 'Solicitante' && req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { materialCode, materialDescription, quantity, justification } = req.body;
  const status = 'Não Validado';
  db.run(`INSERT INTO requests (materialCode, materialDescription, quantity, justification, status, requesterId) VALUES (?, ?, ?, ?, ?, ?)`, 
    [materialCode, materialDescription, quantity, justification, status, req.user.id], function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    res.status(201).json({ message: 'Request created successfully', requestId: this.lastID });
  });
});

// Get all requests (with filters and pagination)
app.get('/requests', authenticateToken, (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
  let query = `SELECT r.*, u.firstName as requesterFirstName, u.lastName as requesterLastName FROM requests r JOIN users u ON r.requesterId = u.id WHERE 1=1`;
  const params = [];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (startDate) {
    query += ` AND createdAt >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND createdAt <= ?`;
    params.push(endDate);
  }

  // Role-based access control for viewing requests
  if (req.user.role === 'Solicitante') {
    query += ` AND requesterId = ?`;
    params.push(req.user.id);
  } else if (req.user.role === 'Gestor') {
    query += ` AND status = 'Não Validado'`; // Gestor only sees pending for approval
  } else if (req.user.role === 'PCP') {
    query += ` AND status = 'Aprovado pelo Gestor'`; // PCP only sees approved for fulfillment
  }

  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as count FROM requests WHERE 1=1`;
    const countParams = [];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    if (startDate) {
      countQuery += ` AND createdAt >= ?`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND createdAt <= ?`;
      countParams.push(endDate);
    }
    if (req.user.role === 'Solicitante') {
      countQuery += ` AND requesterId = ?`;
      countParams.push(req.user.id);
    } else if (req.user.role === 'Gestor') {
      countQuery += ` AND status = 'Não Validado'`;
    } else if (req.user.role === 'PCP') {
      countQuery += ` AND status = 'Aprovado pelo Gestor'`;
    }

    db.get(countQuery, countParams, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json({ requests: rows, total: result.count, page, limit });
    });
  });
});

// Update request status (Gestor: Approve/Reprove)
app.put('/requests/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role === 'Gestor') {
    if (status !== 'Aprovado pelo Gestor' && status !== 'Reprovado') {
      return res.status(400).json({ message: 'Invalid status for Gestor' });
    }
    db.run(`UPDATE requests SET status = ?, approverId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND status = 'Não Validado'`, 
      [status, req.user.id, id], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found or not in "Não Validado" status' });
      }
      res.json({ message: 'Request status updated successfully' });
    });
  } else if (req.user.role === 'PCP') {
    if (status !== 'Concluído') {
      return res.status(400).json({ message: 'Invalid status for PCP' });
    }
    db.run(`UPDATE requests SET status = ?, pcpId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND status = 'Aprovado pelo Gestor'`, 
      [status, req.user.id, id], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found or not in "Aprovado pelo Gestor" status' });
      }
      res.json({ message: 'Request status updated successfully' });
    });
  } else if (req.user.role === 'Administrador') {
    // Admin can change any status
    db.run(`UPDATE requests SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, 
      [status, id], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json({ message: 'Request status updated successfully by Admin' });
    });
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

// Dashboard data
app.get('/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'Administrador' && req.user.role !== 'Gestor' && req.user.role !== 'PCP') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const dashboardData = {};

  db.get(`SELECT COUNT(*) as totalPending FROM requests WHERE status = 'Não Validado'`, (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    dashboardData.totalPending = row.totalPending;

    db.get(`SELECT COUNT(*) as totalApproved FROM requests WHERE status = 'Aprovado pelo Gestor'`, (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      dashboardData.totalApproved = row.totalApproved;

      db.get(`SELECT COUNT(*) as totalCompleted FROM requests WHERE status = 'Concluído'`, (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        dashboardData.totalCompleted = row.totalCompleted;

        // Example for overdue requests (requires a dueDate column in requests table)
        // For now, just return the counts
        res.json(dashboardData);
      });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});