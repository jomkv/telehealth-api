import { Role } from 'generated/prisma/client';
import { UserPayload } from './user';
import { PopulatedConsultation } from './consultation';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      consultation?: PopulatedConsultation;
    }
  }
}

export {};
