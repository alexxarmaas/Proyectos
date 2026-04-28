const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

router.get('/', appointmentsController.getAll);
router.get('/:id', appointmentsController.getById);
router.post('/', appointmentsController.create);
router.put('/:id', appointmentsController.update);
router.delete('/:id', appointmentsController.remove);

module.exports = router;
