import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { json, urlencoded } from 'express';
import { sequelize, testConnection } from './config/db.js';
import { loginStudent, loginTeacher, loginAdmin } from './controllers/authController.js';

import { sequelize } from './config/db.js';
import { User } from '../models/User.js';
import { Role } from '.../models/Role.js';

const app = express();
const PORT = 3000;

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON and URL-encoded data
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static frontend files (your HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
await testConnection();

// Login routes
app.post('/login/student', loginStudent);
app.post('/login/teacher', loginTeacher);
app.post('/login/admin', loginAdmin);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced successfully!');
});
