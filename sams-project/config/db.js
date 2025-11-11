import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('database_sams', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};
