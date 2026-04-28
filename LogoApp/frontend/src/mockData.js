/**
 * Frontend mock data
 * In production, these would come from API calls to the backend (/api/*)
 */

export const mockPatients = [
  {
    id: 1,
    name: 'Hugo Martín',
    age: 7,
    status: 'active',
    diagnosis: 'Dislalia',
    phone: '612 345 678',
    email: 'padre.hugo@email.com',
    guardianName: 'Pedro Martín',
    nextSession: '2023-11-15T10:00:00',
    notes: 'Paciente muestra gran avance en la pronunciación de fonemas fricativos. Continuar con ejercicios de soplo y praxias. Se recomienda involucrar más a los padres en la lectura nocturna.',
    alerts: ['Alergia al látex.', 'Revisión con otorrino pendiente (Noviembre).'],
    progressHistory: [
      { date: 'Sep', score: 42 },
      { date: 'Oct', score: 55 },
      { date: 'Nov S1', score: 61 },
      { date: 'Nov S2', score: 70 },
      { date: 'Nov S3', score: 74 },
      { date: 'Nov S4', score: 82 },
    ],
    sessionHistory: [
      { date: '10/11/2023', type: 'Terapia', notes: 'Buena disposición. Logró articular la R en sílabas directas.' },
      { date: '03/11/2023', type: 'Terapia', notes: 'Ejercicios de respiración costodiafragmática completados con éxito.' },
      { date: '27/10/2023', type: 'Evaluación', notes: 'Evaluación inicial. Se detecta dislalia en fonemas R y S.' },
    ],
  },
  {
    id: 2,
    name: 'Sofía Gómez',
    age: 5,
    status: 'active',
    diagnosis: 'Retraso del lenguaje',
    phone: '623 456 789',
    email: 'mama.sofia@email.com',
    guardianName: 'Ana Gómez',
    nextSession: '2023-11-16T16:00:00',
    notes: 'Vocabulario en expansión. Trabajar oraciones de 3+ palabras. Alta motivación con juegos.',
    alerts: ['Hipoacusia leve en oído derecho, en seguimiento con audiología.'],
    progressHistory: [
      { date: 'Sep', score: 30 },
      { date: 'Oct', score: 40 },
      { date: 'Nov S1', score: 48 },
      { date: 'Nov S2', score: 52 },
      { date: 'Nov S3', score: 58 },
      { date: 'Nov S4', score: 65 },
    ],
    sessionHistory: [
      { date: '09/11/2023', type: 'Terapia', notes: 'Excelente sesión. Nombró 15 objetos cotidianos correctamente.' },
      { date: '02/11/2023', type: 'Terapia', notes: 'Trabajamos vocabulario con pictogramas.' },
    ],
  },
  {
    id: 3,
    name: 'Carlos Ruiz',
    age: 45,
    status: 'active',
    diagnosis: 'Afasia',
    phone: '634 567 890',
    email: 'carlos.ruiz@email.com',
    guardianName: null,
    nextSession: '2023-11-15T12:00:00',
    notes: 'Paciente con afasia post-ACV. Avance lento pero constante. Buen soporte familiar.',
    alerts: ['Derivado de neurología. Coordinación con equipo médico del Hospital Central.'],
    progressHistory: [
      { date: 'Ago', score: 20 },
      { date: 'Sep', score: 28 },
      { date: 'Oct', score: 35 },
      { date: 'Nov S1', score: 40 },
      { date: 'Nov S2', score: 43 },
      { date: 'Nov S3', score: 47 },
    ],
    sessionHistory: [
      { date: '08/11/2023', type: 'Terapia', notes: 'Mejora en la comprensión de órdenes simples.' },
      { date: '01/11/2023', type: 'Terapia', notes: 'Trabajo en denominación de objetos familiares.' },
    ],
  },
  {
    id: 4,
    name: 'Elena Torres',
    age: 12,
    status: 'inactive',
    diagnosis: 'Disfemia',
    phone: '645 678 901',
    email: 'elena.torres@email.com',
    guardianName: 'Laura Torres',
    nextSession: null,
    notes: 'Paciente pausó el tratamiento temporalmente. Retoma en enero.',
    alerts: [],
    progressHistory: [
      { date: 'Jun', score: 55 },
      { date: 'Jul', score: 63 },
      { date: 'Ago', score: 70 },
      { date: 'Sep', score: 78 },
    ],
    sessionHistory: [
      { date: '15/09/2023', type: 'Revisión', notes: 'Gran mejora. Habla más fluida en contextos controlados.' },
    ],
  },
  {
    id: 5,
    name: 'Mateo Navarro',
    age: 6,
    status: 'active',
    diagnosis: 'Trastorno fonológico',
    phone: '656 789 012',
    email: 'papa.mateo@email.com',
    guardianName: 'Javier Navarro',
    nextSession: '2023-11-17T17:00:00',
    notes: 'Trabaja bien en sesión. Se recomienda más práctica en casa con tarjetas de imágenes.',
    alerts: ['Próxima evaluación de lenguaje con el colegio (diciembre).'],
    progressHistory: [
      { date: 'Oct', score: 38 },
      { date: 'Nov S1', score: 45 },
      { date: 'Nov S2', score: 51 },
      { date: 'Nov S3', score: 57 },
      { date: 'Nov S4', score: 62 },
    ],
    sessionHistory: [
      { date: '10/11/2023', type: 'Terapia', notes: 'Trabajamos los grupos consonánticos tr, dr.' },
      { date: '03/11/2023', type: 'Terapia', notes: 'Fonema /k/ trabajado en posición inicial y final.' },
    ],
  },
];

export const mockAppointments = [
  { id: 1, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-15T10:00:00', type: 'Evaluación', status: 'confirmed' },
  { id: 2, patientId: 3, patientName: 'Carlos Ruiz', date: '2023-11-15T12:00:00', type: 'Terapia', status: 'pending' },
  { id: 3, patientId: 2, patientName: 'Sofía Gómez', date: '2023-11-16T16:00:00', type: 'Terapia', status: 'confirmed' },
  { id: 4, patientId: 5, patientName: 'Mateo Navarro', date: '2023-11-17T17:00:00', type: 'Revisión', status: 'pending' },
];

export const mockExercises = [
  { id: 1, title: 'Ejercicios de respiración', type: 'text', description: 'Realizar inspiraciones profundas y espiraciones lentas contando hasta 5. Repetir 10 veces antes de cada sesión de habla.' },
  { id: 2, title: 'Praxias bucofonatorias', type: 'video', description: 'Ver el video y repetir los movimientos de la lengua y los labios frente al espejo.', link: 'https://example.com/video1' },
  { id: 3, title: 'Discriminación auditiva R/L', type: 'audio', description: 'Escuchar el audio e identificar qué palabra contiene la letra R. Hacer 3 series.', link: 'https://example.com/audio1' },
  { id: 4, title: 'Lectura en voz alta (5 minutos)', type: 'text', description: 'Leer en voz alta durante 5 minutos un cuento apropiado para su edad. El adulto anota las palabras difíciles.' },
];

export const mockInvoices = [
  { id: 1, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-01', amount: 50, currency: 'EUR', status: 'paid' },
  { id: 2, patientId: 2, patientName: 'Sofía Gómez', date: '2023-11-05', amount: 50, currency: 'EUR', status: 'pending' },
  { id: 3, patientId: 3, patientName: 'Carlos Ruiz', date: '2023-11-10', amount: 60, currency: 'EUR', status: 'paid' },
  { id: 4, patientId: 5, patientName: 'Mateo Navarro', date: '2023-11-12', amount: 50, currency: 'EUR', status: 'pending' },
];
