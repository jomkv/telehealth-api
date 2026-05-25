import { PrismaClient } from 'generated/prisma/client';
import { seedUsers } from './user.seeder';

export async function runSeeders(prisma: PrismaClient) {
  await seedUsers(prisma);
}
