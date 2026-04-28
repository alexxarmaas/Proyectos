/**
 * Appointment Model
 * Defines the data structure for an Appointment entity.
 */

const Appointment = {
  id: Number,
  patientId: Number,        // FK → Patient.id
  patientName: String,      // Denormalized for display
  date: Date,               // ISO 8601 datetime
  durationMinutes: Number,  // Session duration (default: 45)
  type: String,             // 'Terapia' | 'Evaluación' | 'Revisión'
  status: String,           // 'confirmed' | 'pending' | 'cancelled'
  notes: String,            // Session notes
  createdAt: Date,
  updatedAt: Date,
};

module.exports = Appointment;
