import { Patient, User } from 'generated/prisma/client';
import { DoctorWithSpecialization } from './doctor';

type UserPayload = Pick<User, 'id' | 'role' | 'isOnboarded'>;

export interface MeUser extends Omit<User, 'password'> {
  patient?: Patient;
  doctor?: DoctorWithSpecialization;
}
