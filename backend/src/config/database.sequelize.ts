import { Sequelize, Dialect, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'vertex_learn',
  DB_USER = 'postgres',
  DB_PASSWORD = 'password',
  NODE_ENV = 'development',
  USE_SQLITE = 'false',
} = process.env;

// Resolve dialect
const resolvedDialect: Dialect = USE_SQLITE === 'true' ? 'sqlite' : 'postgres';

// Database configuration
const baseOptions: Options = {
  host: DB_HOST,
  port: parseInt(DB_PORT),
  dialect: resolvedDialect,
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  timezone: '+00:00',
  ...(USE_SQLITE === 'true' ? { storage: './database.sqlite' } : {}),
};

// Create Sequelize instance
export const sequelize = USE_SQLITE === 'true'
  ? new Sequelize(baseOptions)
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, baseOptions);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    if (USE_SQLITE === 'true') {
      console.log('💡 Trying to create SQLite database...');
      try {
        await sequelize.sync({ force: true });
        console.log('✅ SQLite database created successfully.');
        return true;
      } catch (syncError) {
        console.error('❌ Failed to create SQLite database:', syncError);
        return false;
      }
    }
    
    return false;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

export default sequelize;
