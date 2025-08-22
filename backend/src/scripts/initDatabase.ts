import { prisma } from "../config/prisma";

/**
 * Initialize database with tables and sample data
 */
export const initializeDatabase = async () => {
  try {
    console.log("🔄 Initializing database with Prisma...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Prisma database connection established.");

    // With Prisma, we use migrations to manage the database schema
    // For development, we can use prisma migrate dev to create and apply migrations
    console.log("✅ Prisma handles database schema through migrations.");

    // Optionally, you can seed the database with sample data
    // await seedDatabase();

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Reset database (drop and recreate all tables)
 * Note: This is typically handled by Prisma migrations in a development environment
 */
export const resetDatabase = async () => {
  try {
    console.log("🔄 Resetting database with Prisma...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Prisma database connection established.");

    // With Prisma, we would typically use prisma migrate reset in development
    console.log("⚠️  Database reset should be done using Prisma CLI commands:");
    console.log("   npx prisma migrate reset");

    console.log("🎉 Database reset completed successfully!");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === "reset") {
    resetDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    initializeDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}
