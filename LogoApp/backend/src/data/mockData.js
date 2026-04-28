/**
 * Mock data for the API layer.
 * In production, replace these with real database queries.
 * 
 * Suggested future stack:
 * - SQLite (development) → PostgreSQL (production)  
 * - ORM: Prisma or Sequelize
 */

const patients = [
  { id: 1, name: 'Hugo Martín', age: 7, status: 'active', diagnosis: 'Dislalia', phone: '612 345 678', email: 'padre.hugo@email.com', nextSession: '2023-11-15T10:00:00' },
  { id: 2, name: 'Sofía Gómez', age: 5, status: 'active', diagnosis: 'Retraso del lenguaje', phone: '623 456 789', email: 'mama.sofia@email.com', nextSession: '2023-11-16T16:00:00' },
  { id: 3, name: 'Carlos Ruiz', age: 45, status: 'active', diagnosis: 'Afasia', phone: '634 567 890', email: 'carlos.ruiz@email.com', nextSession: '2023-11-15T12:00:00' },
  { id: 4, name: 'Elena Torres', age: 12, status: 'inactive', diagnosis: 'Disfemia', phone: '645 678 901', email: 'elena.torres@email.com', nextSession: null },
  { id: 5, name: 'Mateo Navarro', age: 6, status: 'active', diagnosis: 'Trastorno fonológico', phone: '656 789 012', email: 'papa.mateo@email.com', nextSession: '2023-11-17T17:00:00' },
];

const appointments = [
  { id: 1, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-15T10:00:00', type: 'Evaluación', status: 'confirmed' },
  { id: 2, patientId: 3, patientName: 'Carlos Ruiz', date: '2023-11-15T12:00:00', type: 'Terapia', status: 'pending' },
  { id: 3, patientId: 2, patientName: 'Sofía Gómez', date: '2023-11-16T16:00:00', type: 'Terapia', status: 'confirmed' },
  { id: 4, patientId: 5, patientName: 'Mateo Navarro', date: '2023-11-17T17:00:00', type: 'Revisión', status: 'pending' },
];

const exercises = [
  { id: 1, title: 'Ejercicios de respiración', type: 'text', description: 'Realizar inspiraciones profundas y espiraciones lentas contando hasta 5. Repetir 10 veces.' },
  { id: 2, title: 'Praxias bucofonatorias', type: 'video', description: 'Ver el video y repetir los movimientos de la lengua y los labios.', link: 'https://example.com/video1' },
  { id: 3, title: 'Discriminación auditiva (R/L)', type: 'audio', description: 'Escuchar el audio e identificar qué palabra contiene la letra R.', link: 'https://example.com/audio1' },
];

const invoices = [
  { id: 1, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-01', amount: 50, currency: 'EUR', status: 'paid' },
  { id: 2, patientId: 2, patientName: 'Sofía Gómez', date: '2023-11-05', amount: 50, currency: 'EUR', status: 'pending' },
  { id: 3, patientId: 3, patientName: 'Carlos Ruiz', date: '2023-11-10', amount: 60, currency: 'EUR', status: 'paid' },
  { id: 4, patientId: 5, patientName: 'Mateo Navarro', date: '2023-11-12', amount: 50, currency: 'EUR', status: 'pending' },
];

module.exports = { patients, appointments, exercises, invoices };
