// Mock data — replace with real DB queries when connecting a database
const mockPatients = require('../data/mockData').patients;

const patientsController = {
  /**
   * GET /api/patients
   * Returns list of all patients (with optional status filter)
   */
  getAll: (req, res) => {
    const { status } = req.query;
    let patients = [...mockPatients];
    if (status) {
      patients = patients.filter(p => p.status === status);
    }
    res.json({ success: true, data: patients, count: patients.length });
  },

  /**
   * GET /api/patients/:id
   */
  getById: (req, res) => {
    const patient = mockPatients.find(p => p.id === parseInt(req.params.id));
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    res.json({ success: true, data: patient });
  },

  /**
   * POST /api/patients
   */
  create: (req, res) => {
    const { name, age, diagnosis, status } = req.body;
    if (!name || !age) return res.status(400).json({ success: false, error: 'Name and age are required' });
    const newPatient = {
      id: mockPatients.length + 1,
      name,
      age: parseInt(age),
      diagnosis: diagnosis || 'Sin diagnóstico',
      status: status || 'active',
      createdAt: new Date().toISOString(),
    };
    mockPatients.push(newPatient);
    res.status(201).json({ success: true, data: newPatient });
  },

  /**
   * PUT /api/patients/:id
   */
  update: (req, res) => {
    const index = mockPatients.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Patient not found' });
    mockPatients[index] = { ...mockPatients[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: mockPatients[index] });
  },

  /**
   * DELETE /api/patients/:id  (soft delete — sets status to inactive)
   */
  remove: (req, res) => {
    const index = mockPatients.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Patient not found' });
    mockPatients[index].status = 'inactive';
    res.json({ success: true, message: 'Patient deactivated successfully' });
  },
};

module.exports = patientsController;
