import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('sams_database', 'root', '', {
  host: '127.0.0.1',
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
