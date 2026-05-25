import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { ENV_VARS } from 'src/shared/env-variables';
import { runSeeders } from './seeders';

async function main() {
  const adapter = new PrismaPg({
    connectionString: ENV_VARS.dbUrl(),
  });

  const prisma = new PrismaClient({ adapter });

  try {
    await runSeeders(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
