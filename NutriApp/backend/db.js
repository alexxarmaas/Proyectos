const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "nutriapp.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      main_goal TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      general_notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS patient_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      hour TEXT NOT NULL,
      weight REAL,
      observations TEXT,
      habits TEXT,
      recommendations TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS consultation_followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultation_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consultation_id) REFERENCES consultations (id) ON DELETE CASCADE
    )
  `);

  await seedDb();
}

async function seedDb() {
  const existingUser = await get("SELECT id FROM users LIMIT 1");
  if (existingUser) {
    return;
  }

  await run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    ["Laura Varela", "laura@nutriapp.demo", "demo1234"]
  );

  const patients = [
    {
      name: "Marta González",
      email: "marta.gonzalez@gmail.com",
      phone: "+34 611 23 45 67",
      mainGoal: "Bajar 6 kg de forma sostenible",
      status: "active",
      generalNotes:
        "Trabaja en oficina, poco tiempo para cocinar entre semana. Buena adherencia cuando planifica el domingo."
    },
    {
      name: "Carlos Ruiz",
      email: "carlos.ruiz@hotmail.com",
      phone: "+34 622 88 10 44",
      mainGoal: "Mejorar composición corporal y energía",
      status: "active",
      generalNotes:
        "Entrena fuerza 4 veces por semana. Suele saltarse la merienda y llega con mucha hambre a la cena."
    },
    {
      name: "Elena Navarro",
      email: "elena.navarro@yahoo.es",
      phone: "+34 645 77 21 30",
      mainGoal: "Reducir molestias digestivas y regular horarios",
      status: "inactive",
      generalNotes:
        "Pausó seguimiento por viaje de trabajo. Quiere retomar en dos meses."
    },
    {
      name: "Javier Soto",
      email: "javier.soto@gmail.com",
      phone: "+34 654 89 00 19",
      mainGoal: "Optimizar nutrición para media maratón",
      status: "active",
      generalNotes:
        "Muy disciplinado. Necesita afinar estrategia de hidratación y pre-entreno."
    }
  ];

  for (const patient of patients) {
    await run(
      `
      INSERT INTO patients (name, email, phone, main_goal, status, general_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-20 day'), datetime('now'))
    `,
      [
        patient.name,
        patient.email,
        patient.phone,
        patient.mainGoal,
        patient.status,
        patient.generalNotes
      ]
    );
  }

  const marta = await get("SELECT id FROM patients WHERE name = ?", ["Marta González"]);
  const carlos = await get("SELECT id FROM patients WHERE name = ?", ["Carlos Ruiz"]);
  const elena = await get("SELECT id FROM patients WHERE name = ?", ["Elena Navarro"]);
  const javier = await get("SELECT id FROM patients WHERE name = ?", ["Javier Soto"]);

  const notes = [
    [marta.id, "Le funciona desayunar yogur griego con fruta y avena."],
    [marta.id, "Revisión de cena: reducir pedidos a domicilio a 1 por semana."],
    [carlos.id, "Aumentar proteína en desayuno para mejorar saciedad."],
    [javier.id, "Probar gel de hidratos en tiradas > 60 min."],
    [elena.id, "Registrar síntomas digestivos con escala de 1 a 5."]
  ];

  for (const [patientId, content] of notes) {
    await run(
      "INSERT INTO patient_notes (patient_id, content, created_at) VALUES (?, ?, datetime('now', '-3 day'))",
      [patientId, content]
    );
  }

  const consultations = [
    {
      patientId: marta.id,
      date: "2026-04-16",
      hour: "10:30",
      weight: 72.4,
      observations: "Refiere menos ansiedad nocturna.",
      habits: "Cumplió hidratación 5/7 días.",
      recommendations: "Añadir snack de media tarde rico en proteína.",
      status: "completed"
    },
    {
      patientId: marta.id,
      date: "2026-04-24",
      hour: "10:00",
      weight: 71.9,
      observations: "",
      habits: "Pendiente de revisión semanal.",
      recommendations: "Revisar menú batch cooking.",
      status: "pending"
    },
    {
      patientId: carlos.id,
      date: "2026-04-22",
      hour: "18:00",
      weight: 84.1,
      observations: "Mejor energía en entrenos matutinos.",
      habits: "Cumplió 80% plan semanal.",
      recommendations: "Mantener distribución de comidas cada 4 horas.",
      status: "pending"
    },
    {
      patientId: javier.id,
      date: "2026-04-20",
      hour: "08:30",
      weight: 69.7,
      observations: "Buena tolerancia digestiva antes de correr.",
      habits: "Excelente adherencia.",
      recommendations: "Ajustar sal en días de calor.",
      status: "completed"
    },
    {
      patientId: elena.id,
      date: "2026-04-10",
      hour: "16:00",
      weight: 61.2,
      observations: "Se pospone seguimiento por viaje.",
      habits: "Sin registro completo.",
      recommendations: "Retomar diario de comidas al volver.",
      status: "cancelled"
    }
  ];

  for (const consult of consultations) {
    await run(
      `
      INSERT INTO consultations
      (patient_id, date, hour, weight, observations, habits, recommendations, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-10 day'), datetime('now'))
    `,
      [
        consult.patientId,
        consult.date,
        consult.hour,
        consult.weight,
        consult.observations,
        consult.habits,
        consult.recommendations,
        consult.status
      ]
    );
  }

  const martaConsult = await get(
    "SELECT id FROM consultations WHERE patient_id = ? ORDER BY id DESC LIMIT 1",
    [marta.id]
  );
  const javierConsult = await get(
    "SELECT id FROM consultations WHERE patient_id = ? ORDER BY id DESC LIMIT 1",
    [javier.id]
  );

  await run(
    "INSERT INTO consultation_followups (consultation_id, content, created_at) VALUES (?, ?, datetime('now', '-1 day'))",
    [martaConsult.id, "Aumentó pasos diarios de 5.000 a 7.500."]
  );
  await run(
    "INSERT INTO consultation_followups (consultation_id, content, created_at) VALUES (?, ?, datetime('now', '-1 day'))",
    [javierConsult.id, "Reporta mejor recuperación con cena post-entreno."]
  );
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
