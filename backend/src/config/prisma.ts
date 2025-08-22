import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a single instance of Prisma Client
const prismaClient = new PrismaClient();

// Extend Prisma Client with Accelerate for better performance
// Note: This requires setting up Prisma Accelerate in production
export const prisma = prismaClient.$extends(withAccelerate());

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log(
      "✅ Prisma database connection has been established successfully."
    );
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    return false;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("✅ Prisma database connection closed successfully.");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
};

export default prisma;
