import { prisma } from './prisma';
import { hashPassword } from './auth';

export async function ensureAdminPasswordBootstrapped() {
  const existing = await prisma.adminSetting.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  const bootstrap = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!bootstrap) {
    throw new Error(
      'Admin password not initialized. Set ADMIN_BOOTSTRAP_PASSWORD and run the login once to bootstrap.'
    );
  }

  const passwordHash = await hashPassword(bootstrap);
  return prisma.adminSetting.create({ data: { id: 1, passwordHash } });
}
