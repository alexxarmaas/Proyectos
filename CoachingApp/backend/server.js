const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const isVercel = process.env.VERCEL === '1';

const db = isVercel ? null : require('./db');

const mockStore = createMockStore();

function createMockStore() {
  return {
    users: [{ id: 1, email: 'coach@demo.com', password: 'admin123', name: 'Coach M. Demo' }],
    clients: [
      {
        id: 1,
        name: 'Laura Gómez',
        email: 'laura.gomez@example.com',
        phone: '+34 600 123 456',
        objective: 'Mejorar liderazgo de equipo',
        status: 'active',
        notes: 'Cliente muy enfocada. Trabajar en delegación.'
      },
      {
        id: 2,
        name: 'Carlos Ruiz',
        email: 'carlos.r@example.com',
        phone: '+34 611 222 333',
        objective: 'Transición de carrera profesional',
        status: 'active',
        notes: 'Quiere cambiar del sector marketing a tech.'
      },
      {
        id: 3,
        name: 'Ana Torres',
        email: 'ana.torres@empresa.com',
        phone: '+34 622 444 555',
        objective: 'Gestión del estrés en el trabajo',
        status: 'active',
        notes: 'Directiva con mucho burnout, ejercicios de respiración.'
      }
    ],
    sessions: [
      {
        id: 1,
        client_id: 1,
        date: '2026-05-05',
        time: '10:00',
        duration: 60,
        topic: 'Revisión de roles de equipo',
        notes: 'Pendiente de definir el marco de trabajo.',
        status: 'pending'
      },
      {
        id: 2,
        client_id: 2,
        date: '2026-05-04',
        time: '16:00',
        duration: 45,
        topic: 'Identificación de habilidades clave',
        notes: 'Hicimos un análisis DAFO inicial',
        status: 'completed'
      },
      {
        id: 3,
        client_id: 3,
        date: '2026-05-05',
        time: '12:00',
        duration: 60,
        topic: 'Técnicas de agilidad emocional',
        notes: '',
        status: 'pending'
      }
    ],
    goals: [
      { id: 1, client_id: 1, title: 'Definir OKRs del equipo Q3', category: 'Liderazgo', status: 'completed', target_date: '2026-05-04' },
      { id: 2, client_id: 1, title: 'Estrategia de delegación', category: 'Desarrollo', status: 'in_progress', target_date: '2026-05-05' },
      { id: 3, client_id: 2, title: 'Actualizar CV y LinkedIn', category: 'Carrera', status: 'completed', target_date: '2026-05-04' },
      { id: 4, client_id: 2, title: 'Preparar portfolio de proyectos', category: 'Carrera', status: 'in_progress', target_date: '2026-05-15' },
      { id: 5, client_id: 3, title: 'Reducir horas extras', category: 'Bienestar', status: 'in_progress', target_date: '2026-06-01' },
      { id: 6, client_id: 3, title: 'Delegar reportes semanales', category: 'Liderazgo', status: 'pending', target_date: '2026-05-20' }
    ],
    invoices: [
      { id: 1, client_id: 1, amount: 450, concept: 'Pack 4 Sesiones Mensuales', status: 'paid', issue_date: '2026-04-04' },
      { id: 2, client_id: 1, amount: 450, concept: 'Pack 4 Sesiones Mensuales', status: 'pending', issue_date: '2026-05-04' },
      { id: 3, client_id: 2, amount: 120, concept: 'Sesión individual consulta', status: 'paid', issue_date: '2026-04-04' },
      { id: 4, client_id: 3, amount: 650, concept: 'Programa Liderazgo Trimestral', status: 'overdue', issue_date: '2026-03-01' },
      { id: 5, client_id: 3, amount: 150, concept: 'Taller agilidad extra', status: 'pending', issue_date: '2026-05-04' }
    ]
  };
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function clientSessions(clientId) {
  return mockStore.sessions
    .filter((session) => String(session.client_id) === String(clientId))
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

function clientById(clientId) {
  return mockStore.clients.find((client) => String(client.id) === String(clientId));
}

function resolveClientName(clientId) {
  const client = clientById(clientId);
  return client ? client.name : null;
}

function mockDashboard() {
  const activeClientsCount = mockStore.clients.filter((client) => client.status === 'active').length;
  const upcomingSessionsCount = mockStore.sessions.filter((session) => session.status === 'pending').length;
  const totalRevenue = mockStore.invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const pendingInvoicesCount = mockStore.invoices.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue').length;
  const recentSessions = mockStore.sessions
    .slice()
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
    .slice(0, 5)
    .map((session) => ({ ...session, clientName: resolveClientName(session.client_id) }));

  return { activeClientsCount, upcomingSessionsCount, recentSessions, totalRevenue, pendingInvoicesCount };
}

function mockClientProfile(clientId) {
  const client = clientById(clientId);
  if (!client) return null;
  return { ...client, sessions: clientSessions(clientId) };
}

function upsertArray(collection, id, values) {
  const index = collection.findIndex((item) => String(item.id) === String(id));
  if (index === -1) return null;
  collection[index] = { ...collection[index], ...values };
  return collection[index];
}

// --- Auth Endpoints ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (isVercel) {
    const user = mockStore.users.find((item) => item.email === email && item.password === password);
    if (!user) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token: 'mock-jwt-token' });
    return;
  }

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
  if (isVercel) {
    res.json(mockDashboard());
    return;
  }

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
  if (isVercel) {
    res.json(mockStore.clients.slice().sort((a, b) => a.name.localeCompare(b.name)));
    return;
  }

  db.all('SELECT * FROM clients ORDER BY name ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/clients', (req, res) => {
  const { name, email, phone, objective, status = 'active', notes = '' } = req.body;

  if (isVercel) {
    const client = { id: nextId(mockStore.clients), name, email, phone, objective, status, notes };
    mockStore.clients.push(client);
    res.status(201).json(client);
    return;
  }

  const sql = `INSERT INTO clients (name, email, phone, objective, status, notes) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, email, phone, objective, status, notes], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email, phone, objective, status, notes });
  });
});

app.get('/api/clients/:id', (req, res) => {
  if (isVercel) {
    const profile = mockClientProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Client not found' });
    res.json(profile);
    return;
  }

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

  if (isVercel) {
    const updated = upsertArray(mockStore.clients, req.params.id, { name, email, phone, objective, status, notes });
    if (!updated) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true, updated: 1 });
    return;
  }

  const sql = `UPDATE clients SET name = ?, email = ?, phone = ?, objective = ?, status = ?, notes = ? WHERE id = ?`;

  db.run(sql, [name, email, phone, objective, status, notes, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/clients/:id', (req, res) => {
  if (isVercel) {
    const initialCount = mockStore.clients.length;
    mockStore.clients = mockStore.clients.filter((client) => String(client.id) !== String(req.params.id));
    mockStore.sessions = mockStore.sessions.filter((session) => String(session.client_id) !== String(req.params.id));
    mockStore.goals = mockStore.goals.filter((goal) => String(goal.client_id) !== String(req.params.id));
    mockStore.invoices = mockStore.invoices.filter((invoice) => String(invoice.client_id) !== String(req.params.id));
    res.json({ success: true, deleted: initialCount - mockStore.clients.length });
    return;
  }

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

  if (isVercel) {
    const goals = mockStore.goals
      .filter((goal) => !client_id || String(goal.client_id) === String(client_id))
      .sort((a, b) => `${a.target_date}`.localeCompare(`${b.target_date}`));
    res.json(goals);
    return;
  }

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

  if (isVercel) {
    const goal = { id: nextId(mockStore.goals), client_id, title, category, status, target_date };
    mockStore.goals.push(goal);
    res.status(201).json(goal);
    return;
  }

  const sql = `INSERT INTO goals (client_id, title, category, status, target_date) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, title, category, status, target_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, title, category, status, target_date });
  });
});

app.put('/api/goals/:id', (req, res) => {
  const { title, category, status, target_date } = req.body;

  if (isVercel) {
    const updated = upsertArray(mockStore.goals, req.params.id, { title, category, status, target_date });
    if (!updated) return res.status(404).json({ error: 'Goal not found' });
    res.json({ success: true, updated: 1 });
    return;
  }

  const sql = `UPDATE goals SET title = ?, category = ?, status = ?, target_date = ? WHERE id = ?`;

  db.run(sql, [title, category, status, target_date, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/goals/:id', (req, res) => {
  if (isVercel) {
    const before = mockStore.goals.length;
    mockStore.goals = mockStore.goals.filter((goal) => String(goal.id) !== String(req.params.id));
    res.json({ success: true, deleted: before - mockStore.goals.length });
    return;
  }

  db.run('DELETE FROM goals WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

// --- Invoices Endpoints ---

app.get('/api/invoices', (req, res) => {
  if (isVercel) {
    const invoices = mockStore.invoices
      .slice()
      .sort((a, b) => `${b.issue_date}`.localeCompare(`${a.issue_date}`))
      .map((invoice) => ({ ...invoice, clientName: resolveClientName(invoice.client_id) }));
    res.json(invoices);
    return;
  }

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

  if (isVercel) {
    const invoice = { id: nextId(mockStore.invoices), client_id, amount: Number(amount), concept, status, issue_date };
    mockStore.invoices.push(invoice);
    res.status(201).json(invoice);
    return;
  }

  const sql = `INSERT INTO invoices (client_id, amount, concept, status, issue_date) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, amount, concept, status, issue_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, amount, concept, status, issue_date });
  });
});

app.put('/api/invoices/:id', (req, res) => {
  const { status } = req.body;

  if (isVercel) {
    const updated = upsertArray(mockStore.invoices, req.params.id, { status });
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ success: true, updated: 1 });
    return;
  }

  const sql = `UPDATE invoices SET status = ? WHERE id = ?`;

  db.run(sql, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/invoices/:id', (req, res) => {
  if (isVercel) {
    const before = mockStore.invoices.length;
    mockStore.invoices = mockStore.invoices.filter((invoice) => String(invoice.id) !== String(req.params.id));
    res.json({ success: true, deleted: before - mockStore.invoices.length });
    return;
  }

  db.run('DELETE FROM invoices WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});


app.get('/api/sessions', (req, res) => {
  if (isVercel) {
    const sessions = mockStore.sessions
      .slice()
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .map((session) => ({ ...session, clientName: resolveClientName(session.client_id) }));
    res.json(sessions);
    return;
  }

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

  if (isVercel) {
    const session = { id: nextId(mockStore.sessions), client_id, date, time, duration, topic, notes, status };
    mockStore.sessions.push(session);
    res.status(201).json(session);
    return;
  }

  const sql = `INSERT INTO sessions (client_id, date, time, duration, topic, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, date, time, duration, topic, notes, status], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, client_id, date, time, duration, topic, notes, status });
  });
});

app.put('/api/sessions/:id', (req, res) => {
  const { date, time, duration, topic, notes, status } = req.body;

  if (isVercel) {
    const updated = upsertArray(mockStore.sessions, req.params.id, { date, time, duration, topic, notes, status });
    if (!updated) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, updated: 1 });
    return;
  }

  const sql = `UPDATE sessions SET date = ?, time = ?, duration = ?, topic = ?, notes = ?, status = ? WHERE id = ?`;

  db.run(sql, [date, time, duration, topic, notes, status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/sessions/:id', (req, res) => {
  if (isVercel) {
    const before = mockStore.sessions.length;
    mockStore.sessions = mockStore.sessions.filter((session) => String(session.id) !== String(req.params.id));
    res.json({ success: true, deleted: before - mockStore.sessions.length });
    return;
  }

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
