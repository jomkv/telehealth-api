import { hash } from 'bcryptjs';
import { PrismaClient, Role } from 'generated/prisma/client';

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: Role;
  birthday: Date;
  mobileNumber: string;
  isOnboarded?: boolean;
  patient?: {
    weight: number;
    height: number;
  };
  doctor?: {
    specializationLabel: string;
    bio?: string;
    yearsOfPractice?: number;
  };
};

const seedUsersData: SeedUser[] = [
  {
    name: 'Demo Patient',
    email: 'demop@example.com',
    password: 'user123',
    role: Role.PATIENT,
    birthday: new Date('1995-04-12'),
    mobileNumber: '+15550000001',
    isOnboarded: true,
    patient: {
      weight: 68.5,
      height: 170.2,
    },
  },
  {
    name: 'Demo Doctor',
    email: 'demod@example.com',
    password: 'user123',
    role: Role.DOCTOR,
    birthday: new Date('1987-09-03'),
    mobileNumber: '+15550000002',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'General Practice',
      bio: 'General physician focused on primary care and preventive health.',
      yearsOfPractice: 8,
    },
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of seedUsersData) {
    const passwordHash = await hash(user.password, 10);

    let specializationId: string | undefined;
    if (user.doctor) {
      const specialization = await prisma.specialization.findUnique({
        where: { label: user.doctor.specializationLabel },
      });

      if (!specialization) {
        throw new Error(
          `Missing specialization: ${user.doctor.specializationLabel}. Seed specializations first.`,
        );
      }

      specializationId = specialization.id;
    }

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: passwordHash,
        birthday: user.birthday,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isOnboarded: user.isOnboarded ?? false,
        patient: user.patient
          ? {
              upsert: {
                update: {
                  weight: user.patient.weight,
                  height: user.patient.height,
                },
                create: {
                  weight: user.patient.weight,
                  height: user.patient.height,
                },
              },
            }
          : undefined,
        doctor: user.doctor
          ? {
              upsert: {
                update: {
                  specializationId,
                  bio: user.doctor.bio,
                  yearsOfPractice: user.doctor.yearsOfPractice,
                },
                create: {
                  specializationId,
                  bio: user.doctor.bio,
                  yearsOfPractice: user.doctor.yearsOfPractice,
                },
              },
            }
          : undefined,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        birthday: user.birthday,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isOnboarded: user.isOnboarded ?? false,
        patient: user.patient
          ? {
              create: {
                weight: user.patient.weight,
                height: user.patient.height,
              },
            }
          : undefined,
        doctor: user.doctor
          ? {
              create: {
                specializationId,
                bio: user.doctor.bio,
                yearsOfPractice: user.doctor.yearsOfPractice,
              },
            }
          : undefined,
      },
    });
  }
}
