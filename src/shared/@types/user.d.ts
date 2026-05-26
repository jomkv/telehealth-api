import { User } from 'generated/prisma/client';

type UserPayload = Pick<User, 'id' | 'role' | 'isOnboarded'>;
