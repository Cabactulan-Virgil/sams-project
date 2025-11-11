import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});
