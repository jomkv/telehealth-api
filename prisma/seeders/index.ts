import { PrismaClient } from 'generated/prisma/client';
import { seedSpecializations } from './specialization.seeder';
import { seedUsers } from './user.seeder';

export async function runSeeders(prisma: PrismaClient) {
  await seedSpecializations(prisma);
  await seedUsers(prisma);
}
