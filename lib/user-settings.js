import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function ensureUserPasswordBootstrapped() {
  let setting = await prisma.userSetting.findUnique({ where: { id: 1 } });

  if (!setting) {
    const bootstrap = process.env.USER_BOOTSTRAP_PASSWORD;
    if (!bootstrap) {
      throw new Error("Missing USER_BOOTSTRAP_PASSWORD");
    }
    const passwordHash = await bcrypt.hash(bootstrap, 12);
    setting = await prisma.userSetting.create({
      data: { id: 1, passwordHash },
    });
  }

  return setting;
}

export async function setUserPassword(newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.userSetting.upsert({
    where: { id: 1 },
    update: { passwordHash },
    create: { id: 1, passwordHash },
  });
}
