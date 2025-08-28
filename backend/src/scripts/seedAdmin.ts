import dotenv from 'dotenv';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/authService';

dotenv.config();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@vertex.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  try {
    console.log('🔄 Seeding admin user...');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('ℹ️ Admin already exists:', existing.email);
      return;
    }

    const password_hash = await AuthService.hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        email,
        password_hash,
        role: 'admin',
        first_name: 'System',
        last_name: 'Admin',
        is_active: true,
      },
    });

    console.log('✅ Admin created:', admin.email);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();


