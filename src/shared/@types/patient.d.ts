import { Patient, User } from 'generated/prisma/client';

export interface PopulatedPatient extends Patient {
  user: Omit<User, 'password'>;
}
