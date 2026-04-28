const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');

// GET /api/patients
router.get('/', patientsController.getAll);

// GET /api/patients/:id
router.get('/:id', patientsController.getById);

// POST /api/patients
router.post('/', patientsController.create);

// PUT /api/patients/:id
router.put('/:id', patientsController.update);

// DELETE /api/patients/:id (soft delete)
router.delete('/:id', patientsController.remove);

module.exports = router;
