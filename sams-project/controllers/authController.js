// controllers/authController.js
import { Student } from '../models/student.js';
import { Teacher } from '../models/teacher.js';
import { Admin } from '../models/admin.js';
import bcrypt from 'bcrypt'; // for password hashing

// Helper function to check password
const checkPassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

// Student login
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ where: { email } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const validPassword = await checkPassword(password, student.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    res.json({ message: 'Student login successful', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher login
export const loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ where: { email } });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const validPassword = await checkPassword(password, teacher.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    res.json({ message: 'Teacher login successful', teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const validPassword = await checkPassword(password, admin.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    res.json({ message: 'Admin login successful', admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
