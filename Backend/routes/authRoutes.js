const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { login, register } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Register route for admin to register departements
router.post('/register', auth, register);

module.exports = router;