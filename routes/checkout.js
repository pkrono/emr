const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, checkoutController.checkout);

module.exports = router;
