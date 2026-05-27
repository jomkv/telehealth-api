import { Prisma } from 'generated/prisma/client';
import { consultationInclude } from '../constants';

export type PopulatedConsultation = Prisma.ConsultationGetPayload<{
  include: typeof consultationInclude;
}>;
