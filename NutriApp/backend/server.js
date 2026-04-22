const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { initDb, run, get, all } = require("./db");
const { authRequired } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json());

function toNullableText(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value).trim();
}

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email y password son obligatorios" });
      return;
    }

    const user = await get(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [String(email).trim().toLowerCase()]
    );
    if (!user || user.password !== password) {
      res.status(401).json({ message: "Credenciales invalidas" });
      return;
    }

    const token = crypto.randomBytes(24).toString("hex");
    await run("INSERT INTO sessions (token, user_id) VALUES (?, ?)", [token, user.id]);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", authRequired, async (req, res, next) => {
  try {
    await run("DELETE FROM sessions WHERE token = ?", [req.authToken]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/dashboard/summary", authRequired, async (_req, res, next) => {
  try {
    const today = nowIsoDate();

    const [{ total: activePatients }, { total: upcomingCount }] = await Promise.all([
      get("SELECT COUNT(*) AS total FROM patients WHERE status = 'active'"),
      get(
        "SELECT COUNT(*) AS total FROM consultations WHERE status = 'pending' AND date >= ?",
        [today]
      )
    ]);

    const upcomingConsultations = await all(
      `
      SELECT c.id, c.date, c.hour, c.status, p.name AS patient_name
      FROM consultations c
      INNER JOIN patients p ON p.id = c.patient_id
      WHERE c.status = 'pending' AND c.date >= ?
      ORDER BY c.date ASC, c.hour ASC
      LIMIT 5
    `,
      [today]
    );

    const latestFollowups = await all(
      `
      SELECT 'consulta' AS source, cf.created_at, cf.content, p.name AS patient_name
      FROM consultation_followups cf
      INNER JOIN consultations c ON c.id = cf.consultation_id
      INNER JOIN patients p ON p.id = c.patient_id
      UNION ALL
      SELECT 'nota' AS source, pn.created_at, pn.content, p.name AS patient_name
      FROM patient_notes pn
      INNER JOIN patients p ON p.id = pn.patient_id
      ORDER BY created_at DESC
      LIMIT 6
    `
    );

    res.json({
      activePatients,
      upcomingCount,
      upcomingConsultations,
      latestFollowups
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/patients", authRequired, async (req, res, next) => {
  try {
    const { status = "", search = "" } = req.query;
    const conditions = [];
    const params = [];

    if (status === "active" || status === "inactive") {
      conditions.push("p.status = ?");
      params.push(status);
    }
    if (String(search).trim()) {
      conditions.push("(p.name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?)");
      const wildcard = `%${String(search).trim()}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await all(
      `
      SELECT
        p.*,
        COUNT(c.id) AS consultations_count,
        MAX(c.date || ' ' || c.hour) AS last_consultation
      FROM patients p
      LEFT JOIN consultations c ON c.patient_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
      params
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/patients", authRequired, async (req, res, next) => {
  try {
    const { name, email, phone, mainGoal, status = "active", generalNotes = "" } = req.body;
    if (!name || !mainGoal) {
      res.status(400).json({ message: "Nombre y objetivo son obligatorios" });
      return;
    }
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ message: "Estado de paciente invalido" });
      return;
    }

    const result = await run(
      `
      INSERT INTO patients (name, email, phone, main_goal, status, general_notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      [
        String(name).trim(),
        toNullableText(email),
        toNullableText(phone),
        String(mainGoal).trim(),
        status,
        String(generalNotes || "").trim()
      ]
    );

    const created = await get("SELECT * FROM patients WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

app.get("/api/patients/:id", authRequired, async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);
    const patient = await get("SELECT * FROM patients WHERE id = ?", [patientId]);
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" });
      return;
    }

    const [notes, consultations] = await Promise.all([
      all(
        `
        SELECT id, patient_id, content, created_at
        FROM patient_notes
        WHERE patient_id = ?
        ORDER BY created_at DESC
      `,
        [patientId]
      ),
      all(
        `
        SELECT c.*, COUNT(cf.id) AS followups_count
        FROM consultations c
        LEFT JOIN consultation_followups cf ON cf.consultation_id = c.id
        WHERE c.patient_id = ?
        GROUP BY c.id
        ORDER BY c.date DESC, c.hour DESC
      `,
        [patientId]
      )
    ]);

    const consultationIds = consultations.map((consultation) => consultation.id);
    const followups = consultationIds.length
      ? await all(
          `
          SELECT cf.*, c.patient_id
          FROM consultation_followups cf
          INNER JOIN consultations c ON c.id = cf.consultation_id
          WHERE cf.consultation_id IN (${consultationIds.map(() => "?").join(",")})
          ORDER BY cf.created_at DESC
        `,
          consultationIds
        )
      : [];

    res.json({
      ...patient,
      notes,
      consultations,
      followups
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/patients/:id", authRequired, async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);
    const { name, email, phone, mainGoal, status, generalNotes = "" } = req.body;
    if (!name || !mainGoal || !status) {
      res.status(400).json({ message: "Faltan campos obligatorios" });
      return;
    }
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ message: "Estado de paciente invalido" });
      return;
    }

    const existing = await get("SELECT id FROM patients WHERE id = ?", [patientId]);
    if (!existing) {
      res.status(404).json({ message: "Paciente no encontrado" });
      return;
    }

    await run(
      `
      UPDATE patients
      SET name = ?, email = ?, phone = ?, main_goal = ?, status = ?, general_notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
      [
        String(name).trim(),
        toNullableText(email),
        toNullableText(phone),
        String(mainGoal).trim(),
        status,
        String(generalNotes || "").trim(),
        patientId
      ]
    );

    const updated = await get("SELECT * FROM patients WHERE id = ?", [patientId]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/patients/:id", authRequired, async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);
    const deleted = await run("DELETE FROM patients WHERE id = ?", [patientId]);
    if (!deleted.changes) {
      res.status(404).json({ message: "Paciente no encontrado" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/patients/:id/notes", authRequired, async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !String(content).trim()) {
      res.status(400).json({ message: "El contenido de la nota es obligatorio" });
      return;
    }

    const patient = await get("SELECT id FROM patients WHERE id = ?", [patientId]);
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" });
      return;
    }

    const result = await run(
      "INSERT INTO patient_notes (patient_id, content) VALUES (?, ?)",
      [patientId, String(content).trim()]
    );
    const note = await get("SELECT * FROM patient_notes WHERE id = ?", [result.id]);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

app.get("/api/consultations", authRequired, async (req, res, next) => {
  try {
    const { status = "", patientId = "", from = "", to = "" } = req.query;
    const conditions = [];
    const params = [];

    if (["pending", "completed", "cancelled"].includes(String(status))) {
      conditions.push("c.status = ?");
      params.push(status);
    }
    if (patientId) {
      conditions.push("c.patient_id = ?");
      params.push(Number(patientId));
    }
    if (from) {
      conditions.push("c.date >= ?");
      params.push(from);
    }
    if (to) {
      conditions.push("c.date <= ?");
      params.push(to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const consultations = await all(
      `
      SELECT c.*, p.name AS patient_name, COUNT(cf.id) AS followups_count
      FROM consultations c
      INNER JOIN patients p ON p.id = c.patient_id
      LEFT JOIN consultation_followups cf ON cf.consultation_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.date DESC, c.hour DESC
    `,
      params
    );

    res.json(consultations);
  } catch (error) {
    next(error);
  }
});

app.post("/api/consultations", authRequired, async (req, res, next) => {
  try {
    const {
      patientId,
      date,
      hour,
      weight = null,
      observations = "",
      habits = "",
      recommendations = "",
      status = "pending"
    } = req.body;

    if (!patientId || !date || !hour) {
      res.status(400).json({ message: "Paciente, fecha y hora son obligatorios" });
      return;
    }
    if (!["pending", "completed", "cancelled"].includes(status)) {
      res.status(400).json({ message: "Estado de consulta invalido" });
      return;
    }

    const patient = await get("SELECT id FROM patients WHERE id = ?", [Number(patientId)]);
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" });
      return;
    }

    const result = await run(
      `
      INSERT INTO consultations
      (patient_id, date, hour, weight, observations, habits, recommendations, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      [
        Number(patientId),
        date,
        hour,
        weight === null || weight === "" ? null : Number(weight),
        String(observations || "").trim(),
        String(habits || "").trim(),
        String(recommendations || "").trim(),
        status
      ]
    );

    const created = await get(
      `
      SELECT c.*, p.name AS patient_name
      FROM consultations c
      INNER JOIN patients p ON p.id = c.patient_id
      WHERE c.id = ?
    `,
      [result.id]
    );

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

app.put("/api/consultations/:id", authRequired, async (req, res, next) => {
  try {
    const consultationId = Number(req.params.id);
    const {
      patientId,
      date,
      hour,
      weight = null,
      observations = "",
      habits = "",
      recommendations = "",
      status = "pending"
    } = req.body;

    if (!patientId || !date || !hour) {
      res.status(400).json({ message: "Paciente, fecha y hora son obligatorios" });
      return;
    }
    if (!["pending", "completed", "cancelled"].includes(status)) {
      res.status(400).json({ message: "Estado de consulta invalido" });
      return;
    }

    const existing = await get("SELECT id FROM consultations WHERE id = ?", [consultationId]);
    if (!existing) {
      res.status(404).json({ message: "Consulta no encontrada" });
      return;
    }

    await run(
      `
      UPDATE consultations
      SET patient_id = ?, date = ?, hour = ?, weight = ?, observations = ?, habits = ?, recommendations = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
      [
        Number(patientId),
        date,
        hour,
        weight === null || weight === "" ? null : Number(weight),
        String(observations || "").trim(),
        String(habits || "").trim(),
        String(recommendations || "").trim(),
        status,
        consultationId
      ]
    );

    const updated = await get(
      `
      SELECT c.*, p.name AS patient_name
      FROM consultations c
      INNER JOIN patients p ON p.id = c.patient_id
      WHERE c.id = ?
    `,
      [consultationId]
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/consultations/:id", authRequired, async (req, res, next) => {
  try {
    const consultationId = Number(req.params.id);
    const deleted = await run("DELETE FROM consultations WHERE id = ?", [consultationId]);
    if (!deleted.changes) {
      res.status(404).json({ message: "Consulta no encontrada" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/consultations/:id/followups", authRequired, async (req, res, next) => {
  try {
    const consultationId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !String(content).trim()) {
      res.status(400).json({ message: "El contenido del seguimiento es obligatorio" });
      return;
    }

    const consultation = await get("SELECT id FROM consultations WHERE id = ?", [consultationId]);
    if (!consultation) {
      res.status(404).json({ message: "Consulta no encontrada" });
      return;
    }

    const result = await run(
      "INSERT INTO consultation_followups (consultation_id, content) VALUES (?, ?)",
      [consultationId, String(content).trim()]
    );
    const followup = await get("SELECT * FROM consultation_followups WHERE id = ?", [result.id]);
    res.status(201).json(followup);
  } catch (error) {
    next(error);
  }
});

app.get("/api/agenda/week", authRequired, async (req, res, next) => {
  try {
    const startDate = req.query.startDate || nowIsoDate();
    const consultations = await all(
      `
      SELECT c.id, c.date, c.hour, c.status, p.id AS patient_id, p.name AS patient_name
      FROM consultations c
      INNER JOIN patients p ON p.id = c.patient_id
      WHERE c.date BETWEEN date(?) AND date(?, '+6 day')
      ORDER BY c.date ASC, c.hour ASC
    `,
      [startDate, startDate]
    );

    res.json({
      startDate,
      endDate: null,
      consultations
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  // Only expose plain text error for demo/debug speed.
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`NutriApp API corriendo en http://localhost:${PORT}`);
  });
}

start();
