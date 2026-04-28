require('dotenv').config();
const express = require('express');
const cors = require('cors');

const patientsRouter = require('./routes/patients');
const appointmentsRouter = require('./routes/appointments');
const exercisesRouter = require('./routes/exercises');
const billingRouter = require('./routes/billing');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LogoGest API running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/billing', billingRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ LogoGest API running on http://localhost:${PORT}`);
});

module.exports = app;
