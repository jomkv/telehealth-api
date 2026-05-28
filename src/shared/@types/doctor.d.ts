import { Doctor, Specialization } from 'generated/prisma/client';

type SpecializationNoEmbedding = Omit<Specialization, 'embedding'>;

export type DoctorWithSpecialization = Doctor & {
  specialization: SpecializationNoEmbedding;
};
