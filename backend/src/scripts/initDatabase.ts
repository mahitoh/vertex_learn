import { sequelize } from '../config/database';
import '../models'; // Import models to register them

/**
 * Initialize database with tables and sample data
 */
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized.');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Reset database (drop and recreate all tables)
 */
export const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');

    // Drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database reset completed.');

    console.log('🎉 Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'reset') {
    resetDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    initializeDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}
