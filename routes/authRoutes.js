const express = require('express');
const router = express.Router();
const { loginUser, seedUsers, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/seed', seedUsers);
router.get('/users', protect, getUsers);

module.exports = router;
