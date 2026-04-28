const mockData = require('../data/mockData');

const appointmentsController = {
  getAll: (req, res) => {
    const { patientId, date, status } = req.query;
    let appointments = [...mockData.appointments];
    if (patientId) appointments = appointments.filter(a => a.patientId === parseInt(patientId));
    if (status) appointments = appointments.filter(a => a.status === status);
    if (date) appointments = appointments.filter(a => a.date.startsWith(date));
    res.json({ success: true, data: appointments, count: appointments.length });
  },

  getById: (req, res) => {
    const appointment = mockData.appointments.find(a => a.id === parseInt(req.params.id));
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  },

  create: (req, res) => {
    const { patientId, patientName, date, type, status } = req.body;
    if (!patientId || !date) return res.status(400).json({ success: false, error: 'patientId and date are required' });
    const newAppointment = {
      id: mockData.appointments.length + 1,
      patientId: parseInt(patientId),
      patientName: patientName || 'Unknown',
      date,
      type: type || 'Terapia',
      status: status || 'pending',
      createdAt: new Date().toISOString(),
    };
    mockData.appointments.push(newAppointment);
    res.status(201).json({ success: true, data: newAppointment });
  },

  update: (req, res) => {
    const index = mockData.appointments.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Appointment not found' });
    mockData.appointments[index] = { ...mockData.appointments[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: mockData.appointments[index] });
  },

  remove: (req, res) => {
    const index = mockData.appointments.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Appointment not found' });
    mockData.appointments[index].status = 'cancelled';
    res.json({ success: true, message: 'Appointment cancelled' });
  },
};

module.exports = appointmentsController;
