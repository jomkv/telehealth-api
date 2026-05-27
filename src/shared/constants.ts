import { Prisma } from 'generated/prisma/client';

export const consultationInclude = {
  patient: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          birthday: true,
          profilePic: true,
          mobileNumber: true,
        },
      },
    },
  },
  doctor: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          birthday: true,
          profilePic: true,
          mobileNumber: true,
        },
      },
      specialization: { select: { id: true, label: true, description: true } },
    },
  },
} as const satisfies Prisma.ConsultationInclude;
