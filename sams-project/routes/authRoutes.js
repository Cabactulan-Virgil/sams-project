import express from 'express';
import { loginStudent, loginTeacher, loginAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/student', loginStudent);
router.post('/teacher', loginTeacher);
router.post('/admin', loginAdmin);

export default router;
