const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Error opening SQLite database:', error.message);
    return;
  }

  console.log('Connected to NutriApp SQLite database.');
  initializeDatabase();
});

function initializeDatabase() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'nutritionist',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        goal TEXT,
        status TEXT DEFAULT 'active',
        general_notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS patient_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        weight REAL,
        observations TEXT DEFAULT '',
        habits TEXT DEFAULT '',
        recommendations TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        week_start TEXT NOT NULL,
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS meal_plan_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        meal_type TEXT NOT NULL,
        content TEXT DEFAULT '',
        FOREIGN KEY (plan_id) REFERENCES meal_plans (id) ON DELETE CASCADE
      )
    `);

    seedDemoData();
  });
}

function seedDemoData() {
  db.get('SELECT COUNT(*) AS count FROM users', (userError, userRow) => {
    if (userError) {
      console.error('Error checking users seed:', userError.message);
      return;
    }

    if (userRow.count === 0) {
      db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        ['Laura Martín', 'nutri@demo.com', 'admin123']
      );
    }
  });

  db.get('SELECT COUNT(*) AS count FROM patients', (patientError, patientRow) => {
    if (patientError) {
      console.error('Error checking patients seed:', patientError.message);
      return;
    }

    if (patientRow.count > 0) {
      return;
    }

    console.log('Seeding NutriApp demo data...');

    const patients = [
      [
        'Marta Romero',
        'marta.romero@gmail.com',
        '+34 611 203 908',
        'Perder grasa sin hacer una dieta restrictiva',
        'active',
        'Trabaja en oficina. Tolera bien la planificacion semanal y responde mejor a objetivos pequenos.'
      ],
      [
        'David Serrano',
        'd.serrano@correo.es',
        '+34 622 519 441',
        'Mejorar energia y adherencia a una alimentacion equilibrada',
        'active',
        'Entrena 3 veces por semana. Le cuesta desayunar y suele picar por la tarde.'
      ],
      [
        'Lucía Navarro',
        'lucia.navarro@mail.com',
        '+34 699 784 123',
        'Acompañamiento en recomposicion corporal',
        'active',
        'Muy constante. Valora mucho el seguimiento visual y las pautas simples.'
      ],
      [
        'Javier Ortega',
        'javier.ortega@empresa.com',
        '+34 677 888 202',
        'Reordenar horarios y reducir cenas impulsivas',
        'inactive',
        'Ha pausado el seguimiento por viaje de trabajo hasta el mes que viene.'
      ]
    ];

    const notesByPatient = [
      [
        'Prefiere menús cerrados de lunes a viernes y mas flexibilidad el fin de semana.',
        'Le motiva ver cambios en cintura y energia, no solo en peso.'
      ],
      [
        'Suele llegar a la consulta con dudas concretas sobre cenas rapidas.',
        'Quiere opciones practicas para comer fuera de casa sin sentirse fuera del plan.'
      ],
      [
        'Acepta muy bien medir progreso con fotos y registro de sensaciones.',
        'Ya prepara batch cooking dos dias por semana.'
      ],
      [
        'Seguimiento temporalmente en pausa.'
      ]
    ];

    const consultationSeedBuilder = (patientIds) => {
      const today = new Date();
      const offsetDate = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
      };

      return [
        [
          patientIds[0],
          offsetDate(-21),
          '10:00',
          78.4,
          'Refiere mejor digestion y menos hambre nocturna.',
          'Ha mantenido 3 comidas principales y 1 merienda la mayor parte de la semana.',
          'Subir proteina en desayuno y repetir estructura de cenas que mejor funcionaron.',
          'completed'
        ],
        [
          patientIds[0],
          offsetDate(2),
          '09:30',
          77.6,
          'Revision quincenal enfocada en adherencia.',
          'Ha empezado a caminar despues de comer 4 dias por semana.',
          'Mantener pasos diarios y preparar snacks para la oficina.',
          'pending'
        ],
        [
          patientIds[1],
          offsetDate(-7),
          '18:00',
          91.2,
          'Mejor descanso y menos cansancio a media mañana.',
          'Sigue saltandose desayuno dos dias a la semana.',
          'Introducir desayuno liquido facil y definir dos cenas comodin.',
          'completed'
        ],
        [
          patientIds[1],
          offsetDate(4),
          '17:30',
          90.8,
          'Seguimiento de rutina semanal.',
          'Mas regularidad con la compra del domingo.',
          'Simplificar lista de compra y revisar saciedad de media tarde.',
          'pending'
        ],
        [
          patientIds[2],
          offsetDate(-14),
          '12:15',
          64.1,
          'Buena respuesta al aumento de proteina y entrenamiento de fuerza.',
          'Cumplio objetivo de 2 preparaciones base por semana.',
          'Mantener distribucion proteica y valorar ajustes segun sensaciones.',
          'completed'
        ],
        [
          patientIds[2],
          offsetDate(1),
          '12:45',
          63.9,
          'Consulta de seguimiento con control de sensaciones.',
          'Mayor apetito los dias de entrenamiento de tren inferior.',
          'Añadir snack pre entrenamiento y monitorizar recuperacion.',
          'pending'
        ],
        [
          patientIds[3],
          offsetDate(-5),
          '16:00',
          84.5,
          'Consulta reprogramada por viaje.',
          'Pocas comidas estructuradas por cambio de horario.',
          'Retomar rutina al volver y reagendar primera semana de mayo.',
          'cancelled'
        ]
      ];
    };

    const insertPatient = db.prepare(`
      INSERT INTO patients (name, email, phone, goal, status, general_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertedPatientIds = [];
    let insertedCount = 0;

    patients.forEach((patient) => {
      insertPatient.run(patient, function onInsert(error) {
        if (error) {
          console.error('Error seeding patient:', error.message);
          return;
        }

        insertedPatientIds.push(this.lastID);
        insertedCount += 1;

        if (insertedCount === patients.length) {
          insertPatient.finalize(() => {
            const insertNote = db.prepare(`
              INSERT INTO patient_notes (patient_id, content) VALUES (?, ?)
            `);

            notesByPatient.forEach((group, index) => {
              group.forEach((note) => insertNote.run(insertedPatientIds[index], note));
            });

            insertNote.finalize(() => {
              const insertConsultation = db.prepare(`
                INSERT INTO consultations (
                  patient_id, date, time, weight, observations, habits, recommendations, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `);

              consultationSeedBuilder(insertedPatientIds).forEach((consultation) => {
                insertConsultation.run(consultation);
              });

              insertConsultation.finalize(() => {
                // Seed a demo meal plan for the first patient (Marta)
                const martaId = insertedPatientIds[0];
                const today = new Date();
                const dayOfWeek = today.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(today);
                monday.setDate(today.getDate() + diff);
                const weekStart = monday.toISOString().split('T')[0];

                db.run(
                  `INSERT INTO meal_plans (patient_id, title, week_start, notes) VALUES (?, ?, ?, ?)`,
                  [martaId, 'Plan Semana Actual', weekStart, 'Plan equilibrado con foco en proteína y saciedad.'],
                  function onPlan(planErr) {
                    if (planErr) return;
                    const planId = this.lastID;
                    const slots = [
                      // Lunes
                      [planId, 0, 'desayuno', 'Yogur griego con fruta y avena'],
                      [planId, 0, 'almuerzo', 'Ensalada de pollo a la plancha con quinoa'],
                      [planId, 0, 'cena', 'Merluza al horno con verduras asadas'],
                      [planId, 0, 'snack', 'Manzana + puñado de almendras'],
                      // Martes
                      [planId, 1, 'desayuno', 'Tostada integral con aguacate y huevo'],
                      [planId, 1, 'almuerzo', 'Lentejas con arroz y ensalada'],
                      [planId, 1, 'cena', 'Tortilla de verduras + sopa ligera'],
                      [planId, 1, 'snack', 'Hummus con zanahoria'],
                      // Miércoles
                      [planId, 2, 'desayuno', 'Kéfir + fruta de temporada'],
                      [planId, 2, 'almuerzo', 'Pasta integral con pesto y pollo'],
                      [planId, 2, 'cena', 'Salmón a la plancha con boniato'],
                      [planId, 2, 'snack', 'Plátano pequeño antes de entrenar'],
                      // Jueves
                      [planId, 3, 'desayuno', 'Porridge de avena con canela'],
                      [planId, 3, 'almuerzo', 'Arroz con atún y tomate'],
                      [planId, 3, 'cena', 'Crema de calabaza + huevo cocido'],
                      [planId, 3, 'snack', 'Queso fresco + nueces'],
                      // Viernes
                      [planId, 4, 'desayuno', 'Batido proteico con avena y plátano'],
                      [planId, 4, 'almuerzo', 'Pollo al curry con arroz basmati'],
                      [planId, 4, 'cena', 'Pizza integral casera de verduras'],
                      [planId, 4, 'snack', 'Fruta + yogur 0%'],
                      // Sábado
                      [planId, 5, 'desayuno', 'Huevos revueltos con tostada'],
                      [planId, 5, 'almuerzo', 'Libre (comida social)'],
                      [planId, 5, 'cena', 'Ensalada ligera + proteína'],
                      [planId, 5, 'snack', 'Opcional'],
                      // Domingo
                      [planId, 6, 'desayuno', 'Brunch: tostadas, huevo, fruta'],
                      [planId, 6, 'almuerzo', 'Legumbres estofadas (batch cooking)'],
                      [planId, 6, 'cena', 'Sopa + pan integral'],
                      [planId, 6, 'snack', 'Infusión + fruta seca'],
                    ];
                    const insertSlot = db.prepare(
                      `INSERT INTO meal_plan_slots (plan_id, day_of_week, meal_type, content) VALUES (?, ?, ?, ?)`
                    );
                    slots.forEach((slot) => insertSlot.run(slot));
                    insertSlot.finalize();
                  }
                );
              });
            });
          });
        }
      });
    });
  });
}

module.exports = db;
