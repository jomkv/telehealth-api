import { PrismaClient, DayOfWeek } from 'generated/prisma/client';

type AvailabilitySpec = {
  doctorEmail: string;
  schedule: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }[];
};

const availabilityData: AvailabilitySpec[] = [
  // General Practice – Mon–Fri 8:00–17:00, Sat 9:00–13:00
  {
    doctorEmail: 'elena.garcia@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // Internal Medicine – Mon/Wed/Fri 9:00–18:00
  {
    doctorEmail: 'ramon.delacruz@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '09:00', endTime: '18:00' },
    ],
  },
  // Cardiology – Tue/Thu 8:00–16:00, Sat 8:00–12:00
  {
    doctorEmail: 'patricia.sy@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '08:00', endTime: '12:00' },
    ],
  },
  // Dermatology – Mon–Thu 10:00–18:00
  {
    doctorEmail: 'kevin.ong@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '10:00', endTime: '18:00' },
    ],
  },
  // Pediatrics – Mon–Fri 8:00–15:00
  {
    doctorEmail: 'maria.santos@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '15:00' },
    ],
  },
  // OB-GYN – Mon/Tue/Thu/Fri 9:00–17:00
  {
    doctorEmail: 'rosa.fuentes@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '09:00', endTime: '17:00' },
    ],
  },
  // Orthopedics – Mon/Wed/Fri 7:00–15:00
  {
    doctorEmail: 'andrei.bautista@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '07:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '07:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '07:00', endTime: '15:00' },
    ],
  },
  // ENT – Tue/Thu/Sat 9:00–16:00
  {
    doctorEmail: 'joanna.reyes@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // Ophthalmology – Mon–Fri 9:00–16:00
  {
    doctorEmail: 'felix.aquino@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '09:00', endTime: '16:00' },
    ],
  },
  // Psychiatry – Mon/Wed/Fri 13:00–20:00 (afternoon/evening slots)
  {
    doctorEmail: 'clara.navarro@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '13:00', endTime: '20:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '13:00', endTime: '20:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '13:00', endTime: '20:00' },
    ],
  },
  // Neurology – Tue/Thu 8:00–17:00, Sat 9:00–13:00
  {
    doctorEmail: 'miguel.torres@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // Pulmonology – Mon–Fri 8:00–14:00
  {
    doctorEmail: 'sheila.mendez@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '14:00' },
    ],
  },
  // Gastroenterology – Mon/Tue/Thu 9:00–17:00
  {
    doctorEmail: 'bernard.lim@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '17:00' },
    ],
  },
  // Endocrinology – Wed/Thu/Fri 10:00–18:00
  {
    doctorEmail: 'theresa.chua@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.WED, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '10:00', endTime: '18:00' },
    ],
  },
  // Urology – Mon/Wed/Fri 8:00–16:00
  {
    doctorEmail: 'nathaniel.cruz@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '16:00' },
    ],
  },
  // Nephrology – Tue/Thu 8:00–17:00
  {
    doctorEmail: 'grace.villanueva@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '17:00' },
    ],
  },
  // Oncology – Mon–Thu 9:00–16:00 (no Fri/weekend – complex care)
  {
    doctorEmail: 'oscar.reyes@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '16:00' },
    ],
  },
  // Rheumatology – Mon/Wed/Fri 9:00–15:00
  {
    doctorEmail: 'irene.tan@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '09:00', endTime: '15:00' },
    ],
  },
  // Infectious Disease – Mon–Fri 8:00–15:00
  {
    doctorEmail: 'alvin.pascual@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '15:00' },
    ],
  },
  // Hematology – Tue/Thu/Sat 9:00–16:00
  {
    doctorEmail: 'vivian.huang@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // Physical Medicine & Rehab – Mon–Fri 7:00–14:00
  {
    doctorEmail: 'dennis.flores@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '07:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '07:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '07:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '07:00', endTime: '14:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '07:00', endTime: '14:00' },
    ],
  },
  // Allergy & Immunology – Mon/Wed/Fri 10:00–17:00
  {
    doctorEmail: 'vanessa.go@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '10:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '10:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '10:00', endTime: '17:00' },
    ],
  },
  // Surgery – Tue/Wed/Thu 8:00–16:00
  {
    doctorEmail: 'chris.delossantos@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '16:00' },
    ],
  },
  // Family Medicine – Mon–Sat 8:00–17:00
  {
    doctorEmail: 'luz.evangelista@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.FRI, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: DayOfWeek.SAT, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // Geriatrics – Mon/Tue/Wed/Thu 9:00–15:00
  {
    doctorEmail: 'ernesto.magno@example.com',
    schedule: [
      { dayOfWeek: DayOfWeek.MON, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.TUE, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.WED, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: DayOfWeek.THU, startTime: '09:00', endTime: '15:00' },
    ],
  },
];

export async function seedAvailability(prisma: PrismaClient) {
  for (const spec of availabilityData) {
    const user = await prisma.user.findUnique({
      where: { email: spec.doctorEmail },
    });
    if (!user) {
      console.warn(
        `Skipping availability: user not found for ${spec.doctorEmail}`,
      );
      continue;
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });
    if (!doctor) {
      console.warn(
        `Skipping availability: doctor record not found for ${spec.doctorEmail}`,
      );
      continue;
    }

    for (const slot of spec.schedule) {
      await prisma.availabilityTemplate.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: doctor.id,
            dayOfWeek: slot.dayOfWeek,
          },
        },
        update: {
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        create: {
          doctorId: doctor.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });
    }
  }
}
