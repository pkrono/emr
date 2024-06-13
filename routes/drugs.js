const express = require('express');
const router = express.Router();
const drugController = require('../controllers/drugController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, drugController.getAllDrugs);
router.get('/:id', authenticate, drugController.getDrugById);
router.post('/', authenticate, drugController.createDrugs);
router.put('/:id', authenticate, drugController.updateDrug);
router.delete('/:id', authenticate, drugController.deleteDrug);

module.exports = router;
