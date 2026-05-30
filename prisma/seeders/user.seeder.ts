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
    conditions?: string[];
    allergies?: string[];
    medications?: string[];
    notes?: string;
  };
  doctor?: {
    specializationLabel: string;
    bio?: string;
    yearsOfPractice?: number;
  };
};

const seedUsersData: SeedUser[] = [
  // ── PATIENTS ────────────────────────────────────────────────────────────────
  {
    name: 'Marco Reyes',
    email: 'marco.reyes@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1992-03-15'),
    mobileNumber: '9171000001',
    isOnboarded: true,
    patient: {
      weight: 72.0,
      height: 175.0,
      conditions: ['Hypertension'],
      allergies: ['Penicillin'],
      medications: ['Amlodipine 5mg'],
      notes: 'Prefers morning consultations.',
    },
  },
  {
    name: 'Sofia Lim',
    email: 'sofia.lim@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1998-07-22'),
    mobileNumber: '9171000002',
    isOnboarded: true,
    patient: {
      weight: 54.0,
      height: 162.0,
      conditions: ['Asthma'],
      allergies: ['Dust', 'Pollen'],
      medications: ['Salbutamol inhaler'],
    },
  },
  {
    name: 'Daniel Cruz',
    email: 'daniel.cruz@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1985-11-08'),
    mobileNumber: '9171000003',
    isOnboarded: true,
    patient: {
      weight: 88.5,
      height: 178.0,
      conditions: ['Type 2 Diabetes', 'Hypertension'],
      allergies: [],
      medications: ['Metformin 500mg', 'Losartan 50mg'],
      notes: 'Monitor blood sugar regularly.',
    },
  },
  {
    name: 'Anna Villanueva',
    email: 'anna.villanueva@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('2001-05-30'),
    mobileNumber: '9171000004',
    isOnboarded: true,
    patient: {
      weight: 50.0,
      height: 158.0,
      allergies: ['Shellfish'],
      conditions: [],
      medications: [],
    },
  },
  {
    name: 'Rodel Santos',
    email: 'rodel.santos@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1975-09-14'),
    mobileNumber: '9171000005',
    isOnboarded: true,
    patient: {
      weight: 95.0,
      height: 170.0,
      conditions: ['Gout', 'Hyperlipidemia'],
      allergies: ['Sulfa drugs'],
      medications: ['Allopurinol 100mg', 'Atorvastatin 20mg'],
      notes: 'Low-purine diet recommended.',
    },
  },
  {
    name: 'Camille Torres',
    email: 'camille.torres@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1995-01-19'),
    mobileNumber: '9171000006',
    isOnboarded: true,
    patient: {
      weight: 60.0,
      height: 165.0,
      conditions: ['PCOS'],
      allergies: [],
      medications: ['Metformin 500mg'],
    },
  },
  {
    name: 'Jerome Tan',
    email: 'jerome.tan@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1988-04-03'),
    mobileNumber: '9171000007',
    isOnboarded: true,
    patient: {
      weight: 78.0,
      height: 172.0,
      conditions: [],
      allergies: [],
      medications: [],
      notes: 'Annual check-up patient.',
    },
  },
  {
    name: 'Liza Mendoza',
    email: 'liza.mendoza@example.com',
    password: 'patient123',
    role: Role.PATIENT,
    birthday: new Date('1969-12-25'),
    mobileNumber: '9171000008',
    isOnboarded: true,
    patient: {
      weight: 65.0,
      height: 155.0,
      conditions: ['Osteoarthritis', 'Hypothyroidism'],
      allergies: ['Aspirin'],
      medications: ['Levothyroxine 50mcg', 'Celecoxib 200mg'],
    },
  },

  // ── DOCTORS ─────────────────────────────────────────────────────────────────
  {
    name: 'Elena Garcia',
    email: 'elena.garcia@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1980-06-10'),
    mobileNumber: '9181000001',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'General Practice',
      bio: 'Primary care physician with a focus on preventive health and chronic disease management.',
      yearsOfPractice: 14,
    },
  },
  {
    name: 'Ramon Dela Cruz',
    email: 'ramon.delacruz@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1975-03-22'),
    mobileNumber: '9181000002',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Internal Medicine',
      bio: 'Internist specializing in complex multi-system conditions and long-term adult care.',
      yearsOfPractice: 19,
    },
  },
  {
    name: 'Patricia Sy',
    email: 'patricia.sy@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1978-09-05'),
    mobileNumber: '9181000003',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Cardiology',
      bio: 'Cardiologist with experience in heart failure, arrhythmia, and preventive cardiology.',
      yearsOfPractice: 16,
    },
  },
  {
    name: 'Kevin Ong',
    email: 'kevin.ong@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1983-12-14'),
    mobileNumber: '9181000004',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Dermatology',
      bio: 'Dermatologist handling skin conditions, cosmetic concerns, and skin cancer screening.',
      yearsOfPractice: 11,
    },
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1986-04-28'),
    mobileNumber: '9181000005',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Pediatrics',
      bio: 'Pediatrician passionate about child development, vaccinations, and family health education.',
      yearsOfPractice: 9,
    },
  },
  {
    name: 'Rosalinda Fuentes',
    email: 'rosa.fuentes@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1979-07-16'),
    mobileNumber: '9181000006',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Obstetrics & Gynecology',
      bio: 'OB-GYN with expertise in prenatal care, fertility concerns, and reproductive health.',
      yearsOfPractice: 15,
    },
  },
  {
    name: 'Andrei Bautista',
    email: 'andrei.bautista@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1977-02-09'),
    mobileNumber: '9181000007',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Orthopedics',
      bio: 'Orthopedic specialist in joint conditions, sports injuries, and post-surgical rehab.',
      yearsOfPractice: 17,
    },
  },
  {
    name: 'Joanna Reyes',
    email: 'joanna.reyes@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1984-10-31'),
    mobileNumber: '9181000008',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Ear, Nose & Throat (ENT)',
      bio: 'ENT physician experienced in sinusitis, hearing disorders, and throat conditions.',
      yearsOfPractice: 10,
    },
  },
  {
    name: 'Felix Aquino',
    email: 'felix.aquino@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1981-01-17'),
    mobileNumber: '9181000009',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Ophthalmology',
      bio: 'Eye specialist focusing on visual health, cataracts, glaucoma, and corrective needs.',
      yearsOfPractice: 12,
    },
  },
  {
    name: 'Clara Navarro',
    email: 'clara.navarro@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1982-08-20'),
    mobileNumber: '9181000010',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Psychiatry',
      bio: 'Psychiatrist specializing in anxiety, depression, and mood disorder management.',
      yearsOfPractice: 12,
    },
  },
  {
    name: 'Miguel Torres',
    email: 'miguel.torres@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1976-05-04'),
    mobileNumber: '9181000011',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Neurology',
      bio: 'Neurologist with focus on migraines, epilepsy, and neurodegenerative conditions.',
      yearsOfPractice: 18,
    },
  },
  {
    name: 'Sheila Mendez',
    email: 'sheila.mendez@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1985-03-11'),
    mobileNumber: '9181000012',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Pulmonology',
      bio: 'Pulmonologist managing asthma, COPD, TB, and other respiratory conditions.',
      yearsOfPractice: 10,
    },
  },
  {
    name: 'Bernard Lim',
    email: 'bernard.lim@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1974-11-27'),
    mobileNumber: '9181000013',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Gastroenterology',
      bio: 'Gastroenterologist experienced in digestive disorders, liver disease, and GI endoscopy.',
      yearsOfPractice: 20,
    },
  },
  {
    name: 'Theresa Chua',
    email: 'theresa.chua@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1980-07-03'),
    mobileNumber: '9181000014',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Endocrinology',
      bio: 'Endocrinologist focusing on diabetes, thyroid disorders, and hormonal imbalances.',
      yearsOfPractice: 13,
    },
  },
  {
    name: 'Nathaniel Cruz',
    email: 'nathaniel.cruz@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1978-04-19'),
    mobileNumber: '9181000015',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Urology',
      bio: 'Urologist handling urinary tract conditions, kidney stones, and prostate health.',
      yearsOfPractice: 16,
    },
  },
  {
    name: 'Grace Villanueva',
    email: 'grace.villanueva@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1982-09-08'),
    mobileNumber: '9181000016',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Nephrology',
      bio: 'Nephrologist managing chronic kidney disease, dialysis, and hypertension-related kidney issues.',
      yearsOfPractice: 12,
    },
  },
  {
    name: 'Oscar Reyes',
    email: 'oscar.reyes@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1973-12-01'),
    mobileNumber: '9181000017',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Oncology',
      bio: 'Oncologist with expertise in cancer diagnosis, staging, and chemotherapy management.',
      yearsOfPractice: 21,
    },
  },
  {
    name: 'Irene Tan',
    email: 'irene.tan@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1979-06-14'),
    mobileNumber: '9181000018',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Rheumatology',
      bio: 'Rheumatologist specializing in autoimmune conditions like lupus and rheumatoid arthritis.',
      yearsOfPractice: 15,
    },
  },
  {
    name: 'Alvin Pascual',
    email: 'alvin.pascual@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1981-02-26'),
    mobileNumber: '9181000019',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Infectious Disease',
      bio: 'Infectious disease specialist managing complex infections, HIV, and fever of unknown origin.',
      yearsOfPractice: 13,
    },
  },
  {
    name: 'Vivian Huang',
    email: 'vivian.huang@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1983-08-07'),
    mobileNumber: '9181000020',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Hematology',
      bio: 'Hematologist focused on blood disorders, anemia, and clotting conditions.',
      yearsOfPractice: 11,
    },
  },
  {
    name: 'Dennis Flores',
    email: 'dennis.flores@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1977-10-23'),
    mobileNumber: '9181000021',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Physical Medicine & Rehabilitation',
      bio: 'Physiatrist helping patients regain function after injury, stroke, or surgery.',
      yearsOfPractice: 17,
    },
  },
  {
    name: 'Vanessa Go',
    email: 'vanessa.go@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1985-05-18'),
    mobileNumber: '9181000022',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Allergy & Immunology',
      bio: 'Allergist managing food and drug allergies, allergic rhinitis, and immune deficiencies.',
      yearsOfPractice: 9,
    },
  },
  {
    name: 'Christopher Delos Santos',
    email: 'chris.delossantos@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1976-07-30'),
    mobileNumber: '9181000023',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Surgery',
      bio: 'General surgeon handling abdominal conditions, hernias, and pre/post-operative care.',
      yearsOfPractice: 18,
    },
  },
  {
    name: 'Luz Evangelista',
    email: 'luz.evangelista@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1980-11-12'),
    mobileNumber: '9181000024',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Family Medicine',
      bio: 'Family physician providing continuous, comprehensive care for patients of all ages.',
      yearsOfPractice: 14,
    },
  },
  {
    name: 'Ernesto Magno',
    email: 'ernesto.magno@example.com',
    password: 'doctor123',
    role: Role.DOCTOR,
    birthday: new Date('1965-04-05'),
    mobileNumber: '9181000025',
    isOnboarded: true,
    doctor: {
      specializationLabel: 'Geriatrics',
      bio: 'Geriatrician specializing in elderly care, dementia management, and age-related conditions.',
      yearsOfPractice: 25,
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
                  conditions: user.patient.conditions ?? [],
                  allergies: user.patient.allergies ?? [],
                  medications: user.patient.medications ?? [],
                  notes: user.patient.notes,
                },
                create: {
                  weight: user.patient.weight,
                  height: user.patient.height,
                  conditions: user.patient.conditions ?? [],
                  allergies: user.patient.allergies ?? [],
                  medications: user.patient.medications ?? [],
                  notes: user.patient.notes,
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
                conditions: user.patient.conditions ?? [],
                allergies: user.patient.allergies ?? [],
                medications: user.patient.medications ?? [],
                notes: user.patient.notes,
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
