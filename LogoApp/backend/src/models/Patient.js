/**
 * Patient Model
 * Defines the data structure for a Patient entity.
 * Future: replace with ORM model (e.g., Sequelize, Prisma, Mongoose)
 */

const Patient = {
  id: Number,           // Unique identifier
  name: String,         // Full name
  age: Number,          // Age in years
  status: String,       // 'active' | 'inactive'
  diagnosis: String,    // Primary speech therapy diagnosis
  phone: String,        // Contact phone
  email: String,        // Contact email
  guardianName: String, // Parent/guardian name (for children)
  notes: String,        // Therapist notes (free text)
  createdAt: Date,      // Registration date
  updatedAt: Date,
};

module.exports = Patient;
