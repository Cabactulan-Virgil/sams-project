import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { getToken, checkAuth, decodeToken } from './auth.js';


export const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = checkAuth(); // redirects if not logged in
  if (!token) return;

  const payload = decodeToken();
  if (payload) {
    document.querySelector(".welcome-text").textContent = `Welcome, ${payload.username}!`;
  }

  // Now you can use token in all fetch requests
  const users = await fetchData("users", token);
});
