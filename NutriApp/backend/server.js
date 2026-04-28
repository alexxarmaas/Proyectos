const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(cors());
app.use(express.json());

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getStartOfWeek(dateString) {
  const today = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, product: 'NutriApp MVP' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Credenciales invalidas' });
      return;
    }

    res.json({
      success: true,
      token: 'nutriapp-demo-token',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    const today = formatDate(new Date());
    const thisMonthStart = today.substring(0, 7) + '-01';

    const [activePatients, upcomingConsultations, recentFollowUps, nextConsultations, monthlyActivity, plansThisMonth] =
      await Promise.all([
        get(`SELECT COUNT(*) AS total FROM patients WHERE status = 'active'`),
        get(
          `SELECT COUNT(*) AS total
           FROM consultations
           WHERE status = 'pending' AND date >= ?`,
          [today]
        ),
        all(
          `SELECT c.id, c.date, c.time, c.status, c.weight, c.observations, p.name AS patient_name
           FROM consultations c
           INNER JOIN patients p ON p.id = c.patient_id
           WHERE c.status = 'completed'
           ORDER BY c.date DESC, c.time DESC
           LIMIT 4`
        ),
        all(
          `SELECT c.id, c.date, c.time, c.status, c.weight, p.id AS patient_id, p.name AS patient_name
           FROM consultations c
           INNER JOIN patients p ON p.id = c.patient_id
           WHERE c.status = 'pending' AND c.date >= ?
           ORDER BY c.date ASC, c.time ASC
           LIMIT 5`,
          [today]
        ),
        all(
          `SELECT substr(date, 1, 7) AS month, COUNT(*) AS total
           FROM consultations
           GROUP BY substr(date, 1, 7)
           ORDER BY month ASC`
        ),
        get(
          `SELECT COUNT(*) AS total FROM meal_plans WHERE created_at >= ?`,
          [thisMonthStart]
        )
      ]);

    res.json({
      activePatients: activePatients.total,
      upcomingConsultations: upcomingConsultations.total,
      recentFollowUps,
      nextConsultations,
      monthlyActivity,
      plansCreatedThisMonth: plansThisMonth.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients', async (_req, res) => {
  try {
    const patients = await all(
      `SELECT
         p.*,
         (
           SELECT MAX(c.date)
           FROM consultations c
           WHERE c.patient_id = p.id AND c.status = 'completed'
         ) AS last_consultation_date,
         (
           SELECT MIN(c.date)
           FROM consultations c
           WHERE c.patient_id = p.id AND c.status = 'pending'
         ) AS next_consultation_date
       FROM patients p
       ORDER BY p.status = 'active' DESC, p.name ASC`
    );

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone, goal, status = 'active', general_notes = '' } = req.body;

    if (!name) {
      res.status(400).json({ error: 'El nombre es obligatorio' });
      return;
    }

    const result = await run(
      `INSERT INTO patients (name, email, phone, goal, status, general_notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, email, phone, goal, status, general_notes]
    );

    const patient = await get(`SELECT * FROM patients WHERE id = ?`, [result.id]);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await get(`SELECT * FROM patients WHERE id = ?`, [req.params.id]);

    if (!patient) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }

    const [consultations, notes] = await Promise.all([
      all(
        `SELECT c.*, p.name AS patient_name
         FROM consultations c
         INNER JOIN patients p ON p.id = c.patient_id
         WHERE c.patient_id = ?
         ORDER BY c.date DESC, c.time DESC`,
        [req.params.id]
      ),
      all(
        `SELECT * FROM patient_notes WHERE patient_id = ? ORDER BY created_at DESC`,
        [req.params.id]
      )
    ]);

    res.json({
      ...patient,
      consultations,
      notes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { name, email, phone, goal, status, general_notes = '' } = req.body;

    await run(
      `UPDATE patients
       SET name = ?, email = ?, phone = ?, goal = ?, status = ?, general_notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, goal, status, general_notes, req.params.id]
    );

    const patient = await get(`SELECT * FROM patients WHERE id = ?`, [req.params.id]);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const result = await run(`DELETE FROM patients WHERE id = ?`, [req.params.id]);
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients/:id/notes', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'La nota no puede estar vacia' });
      return;
    }

    const result = await run(
      `INSERT INTO patient_notes (patient_id, content) VALUES (?, ?)`,
      [req.params.id, content]
    );

    const note = await get(`SELECT * FROM patient_notes WHERE id = ?`, [result.id]);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:patientId/notes/:noteId', async (req, res) => {
  try {
    const result = await run(
      `DELETE FROM patient_notes WHERE id = ? AND patient_id = ?`,
      [req.params.noteId, req.params.patientId]
    );

    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/consultations', async (_req, res) => {
  try {
    const consultations = await all(
      `SELECT c.*, p.name AS patient_name
       FROM consultations c
       INNER JOIN patients p ON p.id = c.patient_id
       ORDER BY c.date DESC, c.time DESC`
    );

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultations', async (req, res) => {
  try {
    const {
      patient_id,
      date,
      time,
      weight,
      observations = '',
      habits = '',
      recommendations = '',
      status = 'pending'
    } = req.body;

    if (!patient_id || !date || !time) {
      res.status(400).json({ error: 'Paciente, fecha y hora son obligatorios' });
      return;
    }

    const result = await run(
      `INSERT INTO consultations (
        patient_id, date, time, weight, observations, habits, recommendations, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [patient_id, date, time, weight || null, observations, habits, recommendations, status]
    );

    const consultation = await get(
      `SELECT c.*, p.name AS patient_name
       FROM consultations c
       INNER JOIN patients p ON p.id = c.patient_id
       WHERE c.id = ?`,
      [result.id]
    );

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/consultations/:id', async (req, res) => {
  try {
    const {
      patient_id,
      date,
      time,
      weight,
      observations = '',
      habits = '',
      recommendations = '',
      status = 'pending'
    } = req.body;

    await run(
      `UPDATE consultations
       SET patient_id = ?, date = ?, time = ?, weight = ?, observations = ?, habits = ?, recommendations = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [patient_id, date, time, weight || null, observations, habits, recommendations, status, req.params.id]
    );

    const consultation = await get(
      `SELECT c.*, p.name AS patient_name
       FROM consultations c
       INNER JOIN patients p ON p.id = c.patient_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/consultations/:id', async (req, res) => {
  try {
    const result = await run(`DELETE FROM consultations WHERE id = ?`, [req.params.id]);
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Meal Plans Endpoints ---

app.get('/api/patients/:id/meal-plans', async (req, res) => {
  try {
    const plans = await all(
      `SELECT * FROM meal_plans WHERE patient_id = ? ORDER BY week_start DESC`,
      [req.params.id]
    );
    const plansWithSlots = await Promise.all(
      plans.map(async (plan) => {
        const slots = await all(
          `SELECT * FROM meal_plan_slots WHERE plan_id = ? ORDER BY day_of_week ASC`,
          [plan.id]
        );
        return { ...plan, slots };
      })
    );
    res.json(plansWithSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meal-plans', async (req, res) => {
  try {
    const { patient_id, title, week_start, notes = '', slots = [] } = req.body;
    if (!patient_id || !title || !week_start) {
      res.status(400).json({ error: 'Paciente, título y semana son obligatorios' });
      return;
    }
    const result = await run(
      `INSERT INTO meal_plans (patient_id, title, week_start, notes) VALUES (?, ?, ?, ?)`,
      [patient_id, title, week_start, notes]
    );
    const planId = result.id;
    for (const slot of slots) {
      await run(
        `INSERT INTO meal_plan_slots (plan_id, day_of_week, meal_type, content) VALUES (?, ?, ?, ?)`,
        [planId, slot.day_of_week, slot.meal_type, slot.content || '']
      );
    }
    const plan = await get(`SELECT * FROM meal_plans WHERE id = ?`, [planId]);
    const planSlots = await all(`SELECT * FROM meal_plan_slots WHERE plan_id = ?`, [planId]);
    res.status(201).json({ ...plan, slots: planSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/meal-plans/:id', async (req, res) => {
  try {
    const { title, week_start, notes = '', slots = [] } = req.body;
    await run(
      `UPDATE meal_plans SET title = ?, week_start = ?, notes = ? WHERE id = ?`,
      [title, week_start, notes, req.params.id]
    );
    await run(`DELETE FROM meal_plan_slots WHERE plan_id = ?`, [req.params.id]);
    for (const slot of slots) {
      await run(
        `INSERT INTO meal_plan_slots (plan_id, day_of_week, meal_type, content) VALUES (?, ?, ?, ?)`,
        [req.params.id, slot.day_of_week, slot.meal_type, slot.content || '']
      );
    }
    const plan = await get(`SELECT * FROM meal_plans WHERE id = ?`, [req.params.id]);
    const planSlots = await all(`SELECT * FROM meal_plan_slots WHERE plan_id = ?`, [req.params.id]);
    res.json({ ...plan, slots: planSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    const result = await run(`DELETE FROM meal_plans WHERE id = ?`, [req.params.id]);
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agenda/week', async (req, res) => {
  try {
    const start = getStartOfWeek(req.query.start);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const consultations = await all(
      `SELECT c.*, p.name AS patient_name
       FROM consultations c
       INNER JOIN patients p ON p.id = c.patient_id
       WHERE c.date BETWEEN ? AND ?
       ORDER BY c.date ASC, c.time ASC`,
      [formatDate(start), formatDate(end)]
    );

    res.json({
      start: formatDate(start),
      end: formatDate(end),
      consultations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`NutriApp backend running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Use another port with PORT=<value>.`);
    process.exit(1);
    return;
  }

  console.error('Failed to start NutriApp backend:', error.message);
  process.exit(1);
});
