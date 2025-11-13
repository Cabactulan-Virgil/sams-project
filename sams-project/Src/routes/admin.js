const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { getUsers, getClasses, getSubjects } = require('../controllers/adminController');

router.get('/users', authenticateToken, getUsers);
router.get('/classes', authenticateToken, getClasses);
router.get('/subjects', authenticateToken, getSubjects);

module.exports = router;
