// Import and export Prisma client
import { prisma } from '../config/prisma';

// Export Prisma client and models
export { prisma } from '../config/prisma';
export { default as prismaClient } from '../config/prisma';

// Re-export for backward compatibility
export const sequelize = prisma;
export default prisma;
