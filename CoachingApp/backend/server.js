const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const isVercel = process.env.VERCEL === '1';

// --- Auth Endpoints ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ success: true, user: { id: row.id, name: row.name, email: row.email }, token: 'mock-jwt-token' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });
});

// --- Dashboard Endpoints ---

app.get('/api/dashboard', (req, res) => {
  const result = {
    activeClientsCount: 0,
    upcomingSessionsCount: 0,
    recentSessions: [],
    totalRevenue: 0,
    pendingInvoicesCount: 0
  };

  db.get("SELECT COUNT(*) as count FROM clients WHERE status = 'active'", (err, row) => {
    if (row) result.activeClientsCount = row.count;

    db.get("SELECT COUNT(*) as count FROM sessions WHERE status = 'pending'", (err, row2) => {
      if (row2) result.upcomingSessionsCount = row2.count;

      db.get("SELECT SUM(amount) as total FROM invoices WHERE status = 'paid'", (err, row3) => {
        if (row3 && row3.total) result.totalRevenue = row3.total;

        db.get("SELECT COUNT(*) as count FROM invoices WHERE status = 'pending' OR status = 'overdue'", (err, row4) => {
          if (row4) result.pendingInvoicesCount = row4.count;

          const query = `
            SELECT s.*, c.name as clientName 
            FROM sessions s 
            LEFT JOIN clients c ON s.client_id = c.id
            ORDER BY date DESC, time DESC LIMIT 5
          `;
          db.all(query, (err, rows) => {
            if (rows) result.recentSessions = rows;
            res.json(result);
          });
        });
      });
    });
  });
});

// --- Clients Endpoints ---

app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY name ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/clients', (req, res) => {
  const { name, email, phone, objective, status = 'active', notes = '' } = req.body;
  const sql = `INSERT INTO clients (name, email, phone, objective, status, notes) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, email, phone, objective, status, notes], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email, phone, objective, status, notes });
  });
});

app.get('/api/clients/:id', (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, client) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    db.all('SELECT * FROM sessions WHERE client_id = ? ORDER BY date DESC, time DESC', [client.id], (err, sessions) => {
      res.json({ ...client, sessions: sessions || [] });
    });
  });
});

app.put('/api/clients/:id', (req, res) => {
  const { name, email, phone, objective, status, notes } = req.body;
  const sql = `UPDATE clients SET name = ?, email = ?, phone = ?, objective = ?, status = ?, notes = ? WHERE id = ?`;

  db.run(sql, [name, email, phone, objective, status, notes, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/clients/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // Also delete their sessions
    db.run('DELETE FROM sessions WHERE client_id = ?', [req.params.id]);
    res.json({ success: true, deleted: this.changes });
  });
});

// --- Goals Endpoints ---

app.get('/api/goals', (req, res) => {
  const { client_id } = req.query;
  let query = 'SELECT * FROM goals';
  let params = [];
  if (client_id) {
    query += ' WHERE client_id = ?';
    params.push(client_id);
  }
  query += ' ORDER BY target_date ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/goals', (req, res) => {
  const { client_id, title, category, status = 'in_progress', target_date } = req.body;
  const sql = `INSERT INTO goals (client_id, title, category, status, target_date) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, title, category, status, target_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, title, category, status, target_date });
  });
});

app.put('/api/goals/:id', (req, res) => {
  const { title, category, status, target_date } = req.body;
  const sql = `UPDATE goals SET title = ?, category = ?, status = ?, target_date = ? WHERE id = ?`;

  db.run(sql, [title, category, status, target_date, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/goals/:id', (req, res) => {
  db.run('DELETE FROM goals WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

// --- Invoices Endpoints ---

app.get('/api/invoices', (req, res) => {
  const query = `
    SELECT i.*, c.name as clientName 
    FROM invoices i 
    LEFT JOIN clients c ON i.client_id = c.id
    ORDER BY issue_date DESC
  `;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/invoices', (req, res) => {
  const { client_id, amount, concept, status = 'pending', issue_date } = req.body;
  const sql = `INSERT INTO invoices (client_id, amount, concept, status, issue_date) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, amount, concept, status, issue_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, amount, concept, status, issue_date });
  });
});

app.put('/api/invoices/:id', (req, res) => {
  const { status } = req.body;
  const sql = `UPDATE invoices SET status = ? WHERE id = ?`;

  db.run(sql, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/invoices/:id', (req, res) => {
  db.run('DELETE FROM invoices WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});


app.get('/api/sessions', (req, res) => {
  const query = `
    SELECT s.*, c.name as clientName 
    FROM sessions s 
    LEFT JOIN clients c ON s.client_id = c.id
    ORDER BY date ASC, time ASC
  `;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/sessions', (req, res) => {
  const { client_id, date, time, duration = 60, topic, notes = '', status = 'pending' } = req.body;
  const sql = `INSERT INTO sessions (client_id, date, time, duration, topic, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, date, time, duration, topic, notes, status], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, date, time, duration, topic, notes, status });
  });
});

app.put('/api/sessions/:id', (req, res) => {
  const { date, time, duration, topic, notes, status } = req.body;
  const sql = `UPDATE sessions SET date = ?, time = ?, duration = ?, topic = ?, notes = ?, status = ? WHERE id = ?`;

  db.run(sql, [date, time, duration, topic, notes, status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/sessions/:id', (req, res) => {
  db.run('DELETE FROM sessions WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Backend API server running on port ${PORT}`);
  });
}

module.exports = app;
