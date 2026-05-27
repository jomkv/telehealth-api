import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationService } from './consultation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';

const mockPrisma = {
  patient: {
    findUnique: jest.fn(),
  },
  doctor: {
    findUnique: jest.fn(),
  },
  consultation: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  availabilityTemplate: {
    findFirst: jest.fn(),
  },
};

describe('ConsultationService', () => {
  let service: ConsultationService;
  const consultationId = '00000000-0000-0000-0000-000000000000';
  const meetingLink = `https://meet.jit.si/consult-${consultationId}`;
  const now = new Date('2026-05-27T10:00:00.000Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConsultationService>(ConsultationService);
    jest.clearAllMocks();
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(consultationId);
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('creates consultation when patient, doctor, slot all valid', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.availabilityTemplate.findFirst.mockResolvedValue({
      id: 'availability-1',
    });
    mockPrisma.consultation.create.mockResolvedValue({
      id: consultationId,
      meetingLink,
    });

    const scheduledAt = '2026-05-27T11:00:00.000Z';
    const slotEnd = '2026-05-27T12:00:00.000Z';

    const result = await service.create('user-1', {
      doctorId: 'doctor-1',
      scheduledAt,
      patientNotes: 'Headache and fever',
    });

    expect(result).toEqual({
      id: consultationId,
      meetingLink,
    });
    expect(mockPrisma.consultation.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        doctorId: 'doctor-1',
        scheduledAt: {
          gte: new Date(scheduledAt),
          lt: new Date(slotEnd),
        },
        status: {
          in: ['PENDING', 'ONGOING'],
        },
      },
      select: { id: true },
    });
    expect(mockPrisma.consultation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: consultationId,
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(scheduledAt),
        patientNotes: 'Headache and fever',
        meetingLink,
      }),
    });
  });

  it('throws when patient missing', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when doctor missing', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when slot not in availability window', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.availabilityTemplate.findFirst.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T12:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when slot already taken', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce({ id: 'consultation-1' })
      .mockResolvedValueOnce(null);

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when patient already booked for this slot', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'consultation-2' });

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when slot not on the hour', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:30:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when scheduledAt is invalid', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: 'not-a-date',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when scheduledAt is in the past', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T09:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when overlapping slot exists for doctor', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce({ id: 'consultation-1' })
      .mockResolvedValueOnce(null);

    await expect(
      service.create('user-1', {
        doctorId: 'doctor-1',
        scheduledAt: '2026-05-27T11:00:00.000Z',
        patientNotes: 'Headache',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('does not block when existing consultation is DONE', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-1' });
    mockPrisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    mockPrisma.consultation.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.availabilityTemplate.findFirst.mockResolvedValue({
      id: 'availability-1',
    });
    mockPrisma.consultation.create.mockResolvedValue({
      id: consultationId,
      meetingLink,
    });

    await service.create('user-1', {
      doctorId: 'doctor-1',
      scheduledAt: '2026-05-27T11:00:00.000Z',
      patientNotes: 'Headache and fever',
    });

    expect(mockPrisma.consultation.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        doctorId: 'doctor-1',
        scheduledAt: {
          gte: new Date('2026-05-27T11:00:00.000Z'),
          lt: new Date('2026-05-27T12:00:00.000Z'),
        },
        status: {
          in: ['PENDING', 'ONGOING'],
        },
      },
      select: { id: true },
    });
  });
});
