import { Role } from 'generated/prisma/client';
import { UserPayload } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
