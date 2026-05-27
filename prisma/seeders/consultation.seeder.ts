import { PrismaClient, ConsultationStatus } from 'generated/prisma/client';

type ConsultationSpec = {
  patientEmail: string;
  doctorEmail: string;
  scheduledAt: string; // ISO
  meetingLink: string;
  patientNotes: string;
  doctorNotes?: string | null;
  status?: ConsultationStatus;
};

const consultations: ConsultationSpec[] = [
  {
    patientEmail: 'demop@example.com',
    doctorEmail: 'demod@example.com',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // +1 day
    meetingLink: 'https://meet.example/demo-consult-1',
    patientNotes: 'Persistent headache for two days',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'samplep2@example.com',
    doctorEmail: 'demod@example.com',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // +3 days
    meetingLink: 'https://meet.example/demo-consult-2',
    patientNotes: 'Follow-up for medication review',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'demop@example.com',
    doctorEmail: 'demod@example.com',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // -7 days
    meetingLink: 'https://meet.example/demo-consult-3',
    patientNotes: 'Initial consultation for cough',
    doctorNotes: 'Prescribed rest and hydration. Return if worsens.',
    status: ConsultationStatus.DONE,
  },
];

export async function seedConsultations(prisma: PrismaClient) {
  for (const spec of consultations) {
    const patientUser = await prisma.user.findUnique({
      where: { email: spec.patientEmail },
    });
    const doctorUser = await prisma.user.findUnique({
      where: { email: spec.doctorEmail },
    });

    if (!patientUser) {
      console.warn(
        `Skipping consultation: missing patient ${spec.patientEmail}`,
      );
      continue;
    }
    if (!doctorUser) {
      console.warn(`Skipping consultation: missing doctor ${spec.doctorEmail}`);
      continue;
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: patientUser.id },
    });
    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorUser.id },
    });

    if (!patient || !doctor) {
      console.warn(
        `Skipping consultation: missing patient/doctor relation for ${spec.patientEmail}/${spec.doctorEmail}`,
      );
      continue;
    }

    const scheduledAtDate = new Date(spec.scheduledAt);
    // align to hourly intervals (zero minutes/seconds/ms)
    scheduledAtDate.setMinutes(0, 0, 0);

    const existing = await prisma.consultation.findFirst({
      where: {
        OR: [
          { meetingLink: spec.meetingLink },
          {
            patientId: patient.id,
            doctorId: doctor.id,
            scheduledAt: scheduledAtDate,
          },
        ],
      },
    });

    if (existing) continue;

    await prisma.consultation.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: scheduledAtDate,
        meetingLink: spec.meetingLink,
        patientNotes: spec.patientNotes,
        doctorNotes: spec.doctorNotes ?? undefined,
        status: spec.status ?? ConsultationStatus.PENDING,
      },
    });
  }
}
