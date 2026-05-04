const express = require('express');
const cors = require('cors');

const isVercel = process.env.VERCEL === '1';
const db = isVercel ? null : require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(cors());
app.use(express.json());

const mockStore = createMockStore();

function createMockStore() {
  const today = new Date();
  const format = (date) => date.toISOString().split('T')[0];
  const offset = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return format(date);
  };

  return {
    users: [{ id: 1, name: 'Laura Martín', email: 'nutri@demo.com', password: 'admin123', role: 'nutritionist' }],
    patients: [
      { id: 1, name: 'Marta Romero', email: 'marta.romero@gmail.com', phone: '+34 611 203 908', goal: 'Perder grasa sin hacer una dieta restrictiva', status: 'active', general_notes: 'Trabaja en oficina. Tolera bien la planificacion semanal y responde mejor a objetivos pequenos.', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 2, name: 'David Serrano', email: 'd.serrano@correo.es', phone: '+34 622 519 441', goal: 'Mejorar energia y adherencia a una alimentacion equilibrada', status: 'active', general_notes: 'Entrena 3 veces por semana. Le cuesta desayunar y suele picar por la tarde.', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 3, name: 'Lucía Navarro', email: 'lucia.navarro@mail.com', phone: '+34 699 784 123', goal: 'Acompañamiento en recomposicion corporal', status: 'active', general_notes: 'Muy constante. Valora mucho el seguimiento visual y las pautas simples.', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 4, name: 'Javier Ortega', email: 'javier.ortega@empresa.com', phone: '+34 677 888 202', goal: 'Reordenar horarios y reducir cenas impulsivas', status: 'inactive', general_notes: 'Ha pausado el seguimiento por viaje de trabajo hasta el mes que viene.', created_at: '2026-05-04', updated_at: '2026-05-04' }
    ],
    patient_notes: [
      { id: 1, patient_id: 1, content: 'Prefiere menús cerrados de lunes a viernes y mas flexibilidad el fin de semana.', created_at: '2026-05-04' },
      { id: 2, patient_id: 1, content: 'Le motiva ver cambios en cintura y energia, no solo en peso.', created_at: '2026-05-04' },
      { id: 3, patient_id: 2, content: 'Suele llegar a la consulta con dudas concretas sobre cenas rapidas.', created_at: '2026-05-04' },
      { id: 4, patient_id: 2, content: 'Quiere opciones practicas para comer fuera de casa sin sentirse fuera del plan.', created_at: '2026-05-04' },
      { id: 5, patient_id: 3, content: 'Acepta muy bien medir progreso con fotos y registro de sensaciones.', created_at: '2026-05-04' },
      { id: 6, patient_id: 3, content: 'Ya prepara batch cooking dos dias por semana.', created_at: '2026-05-04' },
      { id: 7, patient_id: 4, content: 'Seguimiento temporalmente en pausa.', created_at: '2026-05-04' }
    ],
    consultations: [
      { id: 1, patient_id: 1, date: offset(-21), time: '10:00', weight: 78.4, observations: 'Refiere mejor digestion y menos hambre nocturna.', habits: 'Ha mantenido 3 comidas principales y 1 merienda la mayor parte de la semana.', recommendations: 'Subir proteina en desayuno y repetir estructura de cenas que mejor funcionaron.', status: 'completed', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 2, patient_id: 1, date: offset(2), time: '09:30', weight: 77.6, observations: 'Revision quincenal enfocada en adherencia.', habits: 'Ha empezado a caminar despues de comer 4 dias por semana.', recommendations: 'Mantener pasos diarios y preparar snacks para la oficina.', status: 'pending', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 3, patient_id: 2, date: offset(-7), time: '18:00', weight: 91.2, observations: 'Mejor descanso y menos cansancio a media mañana.', habits: 'Sigue saltandose desayuno dos dias a la semana.', recommendations: 'Introducir desayuno liquido facil y definir dos cenas comodin.', status: 'completed', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 4, patient_id: 2, date: offset(4), time: '17:30', weight: 90.8, observations: 'Seguimiento de rutina semanal.', habits: 'Mas regularidad con la compra del domingo.', recommendations: 'Simplificar lista de compra y revisar saciedad de media tarde.', status: 'pending', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 5, patient_id: 3, date: offset(-14), time: '12:15', weight: 64.1, observations: 'Buena respuesta al aumento de proteina y entrenamiento de fuerza.', habits: 'Cumplio objetivo de 2 preparaciones base por semana.', recommendations: 'Mantener distribucion proteica y valorar ajustes segun sensaciones.', status: 'completed', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 6, patient_id: 3, date: offset(1), time: '12:45', weight: 63.9, observations: 'Consulta de seguimiento con control de sensaciones.', habits: 'Mayor apetito los dias de entrenamiento de tren inferior.', recommendations: 'Añadir snack pre entrenamiento y monitorizar recuperacion.', status: 'pending', created_at: '2026-05-04', updated_at: '2026-05-04' },
      { id: 7, patient_id: 4, date: offset(-5), time: '16:00', weight: 84.5, observations: 'Consulta reprogramada por viaje.', habits: 'Pocas comidas estructuradas por cambio de horario.', recommendations: 'Retomar rutina al volver y reagendar primera semana de mayo.', status: 'cancelled', created_at: '2026-05-04', updated_at: '2026-05-04' }
    ],
    meal_plans: [
      { id: 1, patient_id: 1, title: 'Plan base Marta', week_start: offset(-1), notes: 'Plan demo con foco en adherencia', created_at: '2026-05-04' },
      { id: 2, patient_id: 2, title: 'Plan energia David', week_start: offset(-1), notes: 'Plan demo con desayunos faciles', created_at: '2026-05-04' }
    ],
    meal_plan_slots: [
      { id: 1, plan_id: 1, day_of_week: 1, meal_type: 'breakfast', content: 'Yogur griego con avena y frutos rojos' },
      { id: 2, plan_id: 1, day_of_week: 1, meal_type: 'lunch', content: 'Pollo con arroz y verduras' },
      { id: 3, plan_id: 2, day_of_week: 2, meal_type: 'breakfast', content: 'Tostadas integrales con huevo y fruta' }
    ]
  };
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function patientName(patientId) {
  const patient = mockStore.patients.find((item) => String(item.id) === String(patientId));
  return patient ? patient.name : null;
}

function patientConsultations(patientId, status) {
  return mockStore.consultations
    .filter((consultation) => String(consultation.patient_id) === String(patientId) && (!status || consultation.status === status))
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

function patientNotes(patientId) {
  return mockStore.patient_notes
    .filter((note) => String(note.patient_id) === String(patientId))
    .sort((a, b) => `${b.created_at}`.localeCompare(`${a.created_at}`));
}

function mealPlansForPatient(patientId) {
  return mockStore.meal_plans
    .filter((plan) => String(plan.patient_id) === String(patientId))
    .sort((a, b) => `${b.week_start}`.localeCompare(`${a.week_start}`));
}

function slotsForPlan(planId) {
  return mockStore.meal_plan_slots
    .filter((slot) => String(slot.plan_id) === String(planId))
    .sort((a, b) => a.day_of_week - b.day_of_week);
}

function attachPatientName(consultation) {
  return { ...consultation, patient_name: patientName(consultation.patient_id) };
}

async function all(sql, params = []) {
  if (!isVercel) {
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

  if (sql.includes('FROM patients p') && sql.includes('last_consultation_date')) {
    return mockStore.patients
      .slice()
      .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'active' ? -1 : 1))
      .map((patient) => ({
        ...patient,
        last_consultation_date: patientConsultations(patient.id, 'completed')[0]?.date || null,
        next_consultation_date: patientConsultations(patient.id, 'pending').slice().reverse()[0]?.date || null
      }));
  }

  if (sql.includes('FROM consultations c') && sql.includes('INNER JOIN patients p ON p.id = c.patient_id') && sql.includes('ORDER BY c.date DESC, c.time DESC') && sql.includes('LIMIT 4')) {
    return mockStore.consultations
      .filter((consultation) => consultation.status === 'completed')
      .slice()
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
      .slice(0, 4)
      .map(attachPatientName);
  }

  if (sql.includes('FROM consultations c') && sql.includes('WHERE c.status = \'pending\' AND c.date >= ?') && sql.includes('ORDER BY c.date ASC, c.time ASC') && sql.includes('LIMIT 5')) {
    const today = params[0];
    return mockStore.consultations
      .filter((consultation) => consultation.status === 'pending' && consultation.date >= today)
      .slice()
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 5)
      .map((consultation) => ({ ...consultation, patient_id: consultation.patient_id, patient_name: patientName(consultation.patient_id) }));
  }

  if (sql.includes('substr(date, 1, 7) AS month') && sql.includes('FROM consultations')) {
    const byMonth = new Map();
    for (const consultation of mockStore.consultations) {
      const month = consultation.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + 1);
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));
  }

  if (sql.includes('SELECT COUNT(*) AS total FROM meal_plans WHERE created_at >= ?')) {
    return [{ total: mockStore.meal_plans.filter((plan) => plan.created_at >= params[0]).length }];
  }

  if (sql.includes('FROM patients p ORDER BY p.status = \'active\' DESC, p.name ASC')) {
    return mockStore.patients
      .slice()
      .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'active' ? -1 : 1))
      .map((patient) => ({
        ...patient,
        last_consultation_date: patientConsultations(patient.id, 'completed')[0]?.date || null,
        next_consultation_date: patientConsultations(patient.id, 'pending').slice().reverse()[0]?.date || null
      }));
  }

  if (sql.includes('FROM consultations c') && sql.includes('WHERE c.patient_id = ?') && sql.includes('ORDER BY c.date DESC, c.time DESC')) {
    return patientConsultations(params[0]).map(attachPatientName);
  }

  if (sql.includes('FROM patient_notes WHERE patient_id = ? ORDER BY created_at DESC')) {
    return patientNotes(params[0]);
  }

  if (sql.includes('FROM consultations c') && sql.includes('ORDER BY c.date DESC, c.time DESC') && !sql.includes('LIMIT 4')) {
    return mockStore.consultations.slice().sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).map(attachPatientName);
  }

  if (sql.includes('SELECT * FROM meal_plans WHERE patient_id = ? ORDER BY week_start DESC')) {
    return mealPlansForPatient(params[0]);
  }

  if (sql.includes('SELECT * FROM meal_plan_slots WHERE plan_id = ? ORDER BY day_of_week ASC')) {
    return slotsForPlan(params[0]);
  }

  if (sql.includes('FROM meal_plans WHERE patient_id = ? ORDER BY week_start DESC')) {
    const plans = mealPlansForPatient(params[0]);
    return Promise.all(plans.map(async (plan) => ({ ...plan, slots: slotsForPlan(plan.id) })));
  }

  if (sql.includes('FROM consultations c') && sql.includes('WHERE c.date BETWEEN ? AND ?')) {
    return mockStore.consultations
      .filter((consultation) => consultation.date >= params[0] && consultation.date <= params[1])
      .slice()
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .map(attachPatientName);
  }

  return [];
}

async function get(sql, params = []) {
  if (!isVercel) {
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

  if (sql.includes('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?')) {
    return mockStore.users.find((user) => user.email === params[0] && user.password === params[1]) || null;
  }

  if (sql.includes('SELECT COUNT(*) AS total FROM patients WHERE status = \'active\'')) {
    return { total: mockStore.patients.filter((patient) => patient.status === 'active').length };
  }

  if (sql.includes('SELECT COUNT(*) AS total FROM consultations WHERE status = \'pending\' AND date >= ?')) {
    return { total: mockStore.consultations.filter((consultation) => consultation.status === 'pending' && consultation.date >= params[0]).length };
  }

  if (sql.includes('SELECT COUNT(*) AS total FROM meal_plans WHERE created_at >= ?')) {
    return { total: mockStore.meal_plans.filter((plan) => plan.created_at >= params[0]).length };
  }

  if (sql.includes('SELECT * FROM patients WHERE id = ?')) {
    return mockStore.patients.find((patient) => String(patient.id) === String(params[0])) || null;
  }

  if (sql.includes('SELECT MAX(c.date)') && sql.includes('FROM consultations c')) {
    const rows = patientConsultations(params[0], 'completed');
    return rows[0]?.date || null;
  }

  if (sql.includes('SELECT MIN(c.date)') && sql.includes('FROM consultations c')) {
    const rows = patientConsultations(params[0], 'pending');
    return rows.length ? rows[rows.length - 1].date : null;
  }

  if (sql.includes('SELECT * FROM patient_notes WHERE id = ?')) {
    return mockStore.patient_notes.find((note) => String(note.id) === String(params[0])) || null;
  }

  if (sql.includes('SELECT c.*, p.name AS patient_name') && sql.includes('WHERE c.id = ?')) {
    const consultation = mockStore.consultations.find((item) => String(item.id) === String(params[0]));
    if (!consultation) return null;
    return attachPatientName(consultation);
  }

  if (sql.includes('SELECT * FROM meal_plans WHERE id = ?')) {
    return mockStore.meal_plans.find((plan) => String(plan.id) === String(params[0])) || null;
  }

  return null;
}

async function run(sql, params = []) {
  if (!isVercel) {
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

  if (sql.includes('INSERT INTO patients')) {
    const patient = {
      id: nextId(mockStore.patients),
      name: params[0],
      email: params[1],
      phone: params[2],
      goal: params[3],
      status: params[4],
      general_notes: params[5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockStore.patients.push(patient);
    return { id: patient.id, changes: 1 };
  }

  if (sql.includes('UPDATE patients')) {
    const patient = mockStore.patients.find((item) => String(item.id) === String(params[6]));
    if (!patient) return { id: null, changes: 0 };
    Object.assign(patient, { name: params[0], email: params[1], phone: params[2], goal: params[3], status: params[4], general_notes: params[5], updated_at: new Date().toISOString() });
    return { id: patient.id, changes: 1 };
  }

  if (sql.includes('DELETE FROM patients WHERE id = ?')) {
    const before = mockStore.patients.length;
    mockStore.patients = mockStore.patients.filter((item) => String(item.id) !== String(params[0]));
    mockStore.consultations = mockStore.consultations.filter((item) => String(item.patient_id) !== String(params[0]));
    mockStore.patient_notes = mockStore.patient_notes.filter((item) => String(item.patient_id) !== String(params[0]));
    mockStore.meal_plans = mockStore.meal_plans.filter((item) => String(item.patient_id) !== String(params[0]));
    mockStore.meal_plan_slots = mockStore.meal_plan_slots.filter((item) => !mockStore.meal_plans.some((plan) => String(plan.id) === String(item.plan_id)));
    return { id: null, changes: before - mockStore.patients.length };
  }

  if (sql.includes('INSERT INTO patient_notes')) {
    const note = { id: nextId(mockStore.patient_notes), patient_id: params[0], content: params[1], created_at: new Date().toISOString() };
    mockStore.patient_notes.push(note);
    return { id: note.id, changes: 1 };
  }

  if (sql.includes('DELETE FROM patient_notes WHERE id = ? AND patient_id = ?')) {
    const before = mockStore.patient_notes.length;
    mockStore.patient_notes = mockStore.patient_notes.filter((item) => !(String(item.id) === String(params[0]) && String(item.patient_id) === String(params[1])));
    return { id: null, changes: before - mockStore.patient_notes.length };
  }

  if (sql.includes('INSERT INTO consultations')) {
    const consultation = {
      id: nextId(mockStore.consultations),
      patient_id: params[0],
      date: params[1],
      time: params[2],
      weight: params[3],
      observations: params[4],
      habits: params[5],
      recommendations: params[6],
      status: params[7],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockStore.consultations.push(consultation);
    return { id: consultation.id, changes: 1 };
  }

  if (sql.includes('UPDATE consultations')) {
    const consultation = mockStore.consultations.find((item) => String(item.id) === String(params[8] || params[7]));
    if (!consultation) return { id: null, changes: 0 };
    Object.assign(consultation, { patient_id: params[0], date: params[1], time: params[2], weight: params[3], observations: params[4], habits: params[5], recommendations: params[6], status: params[7], updated_at: new Date().toISOString() });
    return { id: consultation.id, changes: 1 };
  }

  if (sql.includes('DELETE FROM consultations WHERE id = ?')) {
    const before = mockStore.consultations.length;
    mockStore.consultations = mockStore.consultations.filter((item) => String(item.id) !== String(params[0]));
    return { id: null, changes: before - mockStore.consultations.length };
  }

  if (sql.includes('INSERT INTO meal_plans')) {
    const plan = { id: nextId(mockStore.meal_plans), patient_id: params[0], title: params[1], week_start: params[2], notes: params[3], created_at: new Date().toISOString() };
    mockStore.meal_plans.push(plan);
    return { id: plan.id, changes: 1 };
  }

  if (sql.includes('UPDATE meal_plans SET title = ?, week_start = ?, notes = ? WHERE id = ?')) {
    const plan = mockStore.meal_plans.find((item) => String(item.id) === String(params[3]));
    if (!plan) return { id: null, changes: 0 };
    Object.assign(plan, { title: params[0], week_start: params[1], notes: params[2] });
    return { id: plan.id, changes: 1 };
  }

  if (sql.includes('DELETE FROM meal_plan_slots WHERE plan_id = ?')) {
    const before = mockStore.meal_plan_slots.length;
    mockStore.meal_plan_slots = mockStore.meal_plan_slots.filter((item) => String(item.plan_id) !== String(params[0]));
    return { id: null, changes: before - mockStore.meal_plan_slots.length };
  }

  if (sql.includes('INSERT INTO meal_plan_slots')) {
    const slot = { id: nextId(mockStore.meal_plan_slots), plan_id: params[0], day_of_week: params[1], meal_type: params[2], content: params[3] };
    mockStore.meal_plan_slots.push(slot);
    return { id: slot.id, changes: 1 };
  }

  if (sql.includes('DELETE FROM meal_plans WHERE id = ?')) {
    const before = mockStore.meal_plans.length;
    mockStore.meal_plans = mockStore.meal_plans.filter((item) => String(item.id) !== String(params[0]));
    mockStore.meal_plan_slots = mockStore.meal_plan_slots.filter((item) => String(item.plan_id) !== String(params[0]));
    return { id: null, changes: before - mockStore.meal_plans.length };
  }

  return { id: null, changes: 0 };
}

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

if (!isVercel) {
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
}

module.exports = app;
