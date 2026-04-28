const express = require('express');
const router = express.Router();
const mockData = require('../data/mockData');

router.get('/', (req, res) => res.json({ success: true, data: mockData.exercises }));
router.get('/:id', (req, res) => {
  const ex = mockData.exercises.find(e => e.id === parseInt(req.params.id));
  if (!ex) return res.status(404).json({ success: false, error: 'Exercise not found' });
  res.json({ success: true, data: ex });
});
router.post('/', (req, res) => {
  const ex = { id: mockData.exercises.length + 1, ...req.body, createdAt: new Date().toISOString() };
  mockData.exercises.push(ex);
  res.status(201).json({ success: true, data: ex });
});

module.exports = router;
