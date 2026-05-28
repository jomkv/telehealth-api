import {
  AvailabilityTemplate,
  Doctor,
  Specialization,
  User,
} from 'generated/prisma/client';

type SpecializationNoEmbedding = Omit<Specialization, 'embedding'>;

export type DoctorWithSpecialization = Doctor & {
  specialization: SpecializationNoEmbedding;
};

export interface PopulatedDoctor extends DoctorWithSpecialization {
  user: Omit<User, 'password'>;
  availability?: Pick<
    AvailabilityTemplate,
    'dayOfWeek' | 'startTime' | 'endTime'
  >[];
  bookedSlots?: string[];
  relevanceScore?: number;
}
