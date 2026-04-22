const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize tables
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT
      )`);

      // Clients table
      db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        objective TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Sessions table
      db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER DEFAULT 60,
        topic TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`);
      
      // Seed Demo Data if empty
      seedData();
    });
  }
});

function seedData() {
  // Check if we have clients
  db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding mock data...');
      
      // Insert Coach
      db.run(`INSERT INTO users (email, password, name) VALUES ('coach@demo.com', 'admin123', 'Coach M. Demo')`);
      
      // Insert Clients
      const clients = [
        ['Laura Gómez', 'laura.gomez@example.com', '+34 600 123 456', 'Mejorar liderazgo de equipo', 'active', 'Cliente muy enfocada. Trabajar en delegación.'],
        ['Carlos Ruiz', 'carlos.r@example.com', '+34 611 222 333', 'Transición de carrera profesional', 'active', 'Quiere cambiar del sector marketing a tech.'],
        ['Ana Torres', 'ana.torres@empresa.com', '+34 622 444 555', 'Gestión del estrés en el trabajo', 'active', 'Directiva con mucho burnout, ejercicios de respiración.'],
        ['Miguel Sanz', 'msanz@example.com', '+34 633 666 777', 'Preparar entrevistas', 'inactive', 'Proceso parado temporalmente.']
      ];
      
      const insertClient = db.prepare(`INSERT INTO clients (name, email, phone, objective, status, notes) VALUES (?, ?, ?, ?, ?, ?)`);
      clients.forEach(client => insertClient.run(client));
      insertClient.finalize(() => {
        // After clients inserted, insert sessions
        db.all("SELECT id FROM clients", (err, rows) => {
          if (rows && rows.length >= 3) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const formatDate = (d) => d.toISOString().split('T')[0];
            
            const sessions = [
              [rows[0].id, formatDate(tomorrow), '10:00', 60, 'Revisión de roles de equipo', 'Pendiente de definir el marco de trabajo.', 'pending'],
              [rows[1].id, formatDate(today), '16:00', 45, 'Identificación de habilidades clave', 'Hicimos un análisis DAFO inicial', 'completed'],
              [rows[2].id, formatDate(tomorrow), '12:00', 60, 'Técnicas de agilidad emocional', '', 'pending'],
            ];
            
            const insertSession = db.prepare(`INSERT INTO sessions (client_id, date, time, duration, topic, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            sessions.forEach(s => insertSession.run(s));
            insertSession.finalize();
          }
        });
      });
    }
  });
}

module.exports = db;
