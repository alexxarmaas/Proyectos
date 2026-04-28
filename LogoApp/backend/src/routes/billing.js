const express = require('express');
const router = express.Router();
const mockData = require('../data/mockData');

router.get('/', (req, res) => {
  const { status } = req.query;
  let invoices = [...mockData.invoices];
  if (status) invoices = invoices.filter(i => i.status === status);
  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  res.json({ success: true, data: invoices, total });
});

router.get('/summary', (req, res) => {
  const paid = mockData.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pending = mockData.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  res.json({ success: true, data: { paid, pending, total: paid + pending } });
});

router.put('/:id', (req, res) => {
  const index = mockData.invoices.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Invoice not found' });
  mockData.invoices[index] = { ...mockData.invoices[index], ...req.body };
  res.json({ success: true, data: mockData.invoices[index] });
});

module.exports = router;
