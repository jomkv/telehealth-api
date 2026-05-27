import { PrismaClient } from 'generated/prisma/client';
import { seedSpecializations } from './specialization.seeder';
import { seedUsers } from './user.seeder';
import { seedConsultations } from './consultation.seeder';

export async function runSeeders(prisma: PrismaClient) {
  await seedSpecializations(prisma);
  await seedUsers(prisma);
  await seedConsultations(prisma);
}
