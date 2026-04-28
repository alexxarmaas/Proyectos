/**
 * Invoice Model
 */

const Invoice = {
  id: Number,
  patientId: Number,    // FK → Patient.id
  patientName: String,
  appointmentId: Number,// FK → Appointment.id (optional)
  date: Date,
  amount: Number,       // Amount in currency units
  currency: String,     // Default: 'EUR'
  status: String,       // 'paid' | 'pending' | 'cancelled'
  notes: String,
  createdAt: Date,
};

module.exports = Invoice;
