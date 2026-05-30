import { PrismaClient, ConsultationStatus } from 'generated/prisma/client';

type ConsultationSpec = {
  patientEmail: string;
  doctorEmail: string;
  scheduledAt: Date;
  meetingLink: string;
  patientNotes: string;
  doctorNotes?: string;
  status: ConsultationStatus;
  rescheduledFrom?: Date;
};

// Helper: build a Date snapped to the top of a given hour (minutes/seconds/ms = 0)
function at(offsetDays: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const consultations: ConsultationSpec[] = [
  // ── DONE (past) ─────────────────────────────────────────────────────────────
  {
    patientEmail: 'marco.reyes@example.com',
    doctorEmail: 'patricia.sy@example.com',
    scheduledAt: at(-14, 10),
    meetingLink: 'https://meet.example/consult-001',
    patientNotes: 'Chest tightness and occasional shortness of breath.',
    doctorNotes:
      'ECG within normal limits. Advised low-sodium diet and follow-up in 4 weeks.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'daniel.cruz@example.com',
    doctorEmail: 'theresa.chua@example.com',
    scheduledAt: at(-21, 9),
    meetingLink: 'https://meet.example/consult-002',
    patientNotes:
      'Blood sugar has been consistently high. Fatigue after meals.',
    doctorNotes:
      'Adjusted Metformin dose. Requested HbA1c labs. Diet counseling given.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'liza.mendoza@example.com',
    doctorEmail: 'ernesto.magno@example.com',
    scheduledAt: at(-10, 14),
    meetingLink: 'https://meet.example/consult-003',
    patientNotes: 'Knee pain getting worse, difficulty climbing stairs.',
    doctorNotes:
      'Likely osteoarthritis progression. Referred for X-ray. Celecoxib continued.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'sofia.lim@example.com',
    doctorEmail: 'sheila.mendez@example.com',
    scheduledAt: at(-7, 8),
    meetingLink: 'https://meet.example/consult-004',
    patientNotes: 'Asthma attack last week, used inhaler 3 times in two days.',
    doctorNotes:
      'Triggers reviewed. Stepped up to low-dose ICS. Action plan updated.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'rodel.santos@example.com',
    doctorEmail: 'bernard.lim@example.com',
    scheduledAt: at(-5, 11),
    meetingLink: 'https://meet.example/consult-005',
    patientNotes: 'Recurring bloating and stomach pain after eating.',
    doctorNotes:
      'Suspected GERD. Started on PPI. Advised smaller meals and avoid triggers.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'camille.torres@example.com',
    doctorEmail: 'rosa.fuentes@example.com',
    scheduledAt: at(-12, 10),
    meetingLink: 'https://meet.example/consult-006',
    patientNotes: 'Irregular period for three months, concerned about PCOS.',
    doctorNotes:
      'Ultrasound consistent with PCOS. Continuing Metformin. Lifestyle advice given.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'jerome.tan@example.com',
    doctorEmail: 'elena.garcia@example.com',
    scheduledAt: at(-30, 9),
    meetingLink: 'https://meet.example/consult-007',
    patientNotes: 'Annual check-up. No specific complaints.',
    doctorNotes:
      'Labs all normal. Blood pressure slightly elevated. Monitor and return in 3 months.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'anna.villanueva@example.com',
    doctorEmail: 'kevin.ong@example.com',
    scheduledAt: at(-9, 13),
    meetingLink: 'https://meet.example/consult-008',
    patientNotes: 'Breakout on cheeks and chin, suspect hormonal acne.',
    doctorNotes:
      'Topical retinoid prescribed. Gentle cleanser recommended. Follow-up in 6 weeks.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'marco.reyes@example.com',
    doctorEmail: 'ramon.delacruz@example.com',
    scheduledAt: at(-60, 10),
    meetingLink: 'https://meet.example/consult-009',
    patientNotes: 'Persistent fatigue and mild dizziness for the past month.',
    doctorNotes:
      'CBC showed mild anemia. Ferrous sulfate started. Dietary iron intake reviewed.',
    status: ConsultationStatus.DONE,
  },
  {
    patientEmail: 'daniel.cruz@example.com',
    doctorEmail: 'nathaniel.cruz@example.com',
    scheduledAt: at(-18, 15),
    meetingLink: 'https://meet.example/consult-010',
    patientNotes: 'Burning sensation when urinating for two days.',
    doctorNotes:
      'Urinalysis confirms UTI. Prescribed Co-amoxiclav for 7 days. Increase fluids.',
    status: ConsultationStatus.DONE,
  },

  // ── CANCELLED ────────────────────────────────────────────────────────────────
  {
    patientEmail: 'sofia.lim@example.com',
    doctorEmail: 'joanna.reyes@example.com',
    scheduledAt: at(-3, 10),
    meetingLink: 'https://meet.example/consult-011',
    patientNotes: 'Ear pain and muffled hearing for a week.',
    status: ConsultationStatus.CANCELLED,
  },
  {
    patientEmail: 'jerome.tan@example.com',
    doctorEmail: 'felix.aquino@example.com',
    scheduledAt: at(-2, 14),
    meetingLink: 'https://meet.example/consult-012',
    patientNotes: 'Blurry vision when reading, considering getting glasses.',
    status: ConsultationStatus.CANCELLED,
  },
  {
    patientEmail: 'rodel.santos@example.com',
    doctorEmail: 'irene.tan@example.com',
    scheduledAt: at(-6, 9),
    meetingLink: 'https://meet.example/consult-013',
    patientNotes: 'Joint swelling in both wrists, stiff in the morning.',
    status: ConsultationStatus.CANCELLED,
  },

  // ── PENDING (upcoming) ──────────────────────────────────────────────────────
  {
    patientEmail: 'marco.reyes@example.com',
    doctorEmail: 'patricia.sy@example.com',
    scheduledAt: at(3, 10),
    meetingLink: 'https://meet.example/consult-014',
    patientNotes: 'Follow-up for blood pressure review after 4 weeks.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'daniel.cruz@example.com',
    doctorEmail: 'theresa.chua@example.com',
    scheduledAt: at(5, 9),
    meetingLink: 'https://meet.example/consult-015',
    patientNotes:
      'HbA1c results ready, requesting interpretation and plan review.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'anna.villanueva@example.com',
    doctorEmail: 'rosa.fuentes@example.com',
    scheduledAt: at(7, 11),
    meetingLink: 'https://meet.example/consult-016',
    patientNotes: 'First gynecology visit, general reproductive health check.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'liza.mendoza@example.com',
    doctorEmail: 'grace.villanueva@example.com',
    scheduledAt: at(4, 8),
    meetingLink: 'https://meet.example/consult-017',
    patientNotes: 'Swollen ankles and foamy urine noticed recently.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'sofia.lim@example.com',
    doctorEmail: 'vanessa.go@example.com',
    scheduledAt: at(6, 10),
    meetingLink: 'https://meet.example/consult-018',
    patientNotes:
      'Recurring hives after eating certain foods, want allergy testing guidance.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'camille.torres@example.com',
    doctorEmail: 'clara.navarro@example.com',
    scheduledAt: at(2, 15),
    meetingLink: 'https://meet.example/consult-019',
    patientNotes: 'Feeling persistently low and anxious. Sleep has been poor.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'rodel.santos@example.com',
    doctorEmail: 'andrei.bautista@example.com',
    scheduledAt: at(8, 7),
    meetingLink: 'https://meet.example/consult-020',
    patientNotes: 'Lower back pain when standing for long periods.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'jerome.tan@example.com',
    doctorEmail: 'miguel.torres@example.com',
    scheduledAt: at(10, 9),
    meetingLink: 'https://meet.example/consult-021',
    patientNotes: 'Headaches 4-5 times a week, sometimes with nausea.',
    status: ConsultationStatus.PENDING,
  },
  {
    patientEmail: 'marco.reyes@example.com',
    doctorEmail: 'luz.evangelista@example.com',
    scheduledAt: at(14, 11),
    meetingLink: 'https://meet.example/consult-022',
    patientNotes:
      'Wants a general check-up and discussion on lifestyle changes.',
    status: ConsultationStatus.PENDING,
    rescheduledFrom: at(7, 11),
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

    const existing = await prisma.consultation.findFirst({
      where: {
        OR: [
          { meetingLink: spec.meetingLink },
          {
            patientId: patient.id,
            doctorId: doctor.id,
            scheduledAt: spec.scheduledAt,
          },
        ],
      },
    });

    if (existing) continue;

    await prisma.consultation.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: spec.scheduledAt,
        meetingLink: spec.meetingLink,
        patientNotes: spec.patientNotes,
        doctorNotes: spec.doctorNotes,
        status: spec.status,
        rescheduledFrom: spec.rescheduledFrom,
      },
    });
  }
}
