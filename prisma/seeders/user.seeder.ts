import { hash } from 'bcryptjs';
import { PrismaClient, UserRole } from 'generated/prisma/client';

type SeedUser = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
};

const seedUsersData: SeedUser[] = [
  {
    username: 'demo',
    email: 'demo@example.com',
    password: 'user123',
    role: UserRole.USER,
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of seedUsersData) {
    const passwordHash = await hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        password: passwordHash,
        role: user.role ?? UserRole.USER,
      },
      create: {
        username: user.username,
        email: user.email,
        password: passwordHash,
        role: user.role ?? UserRole.USER,
      },
    });
  }
}
