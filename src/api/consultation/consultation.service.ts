import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { ConsultationStatus, DayOfWeek } from 'generated/prisma/enums';
import { randomUUID } from 'crypto';

const consultationInclude = {
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

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    patientUserId: string,
    createConsultationDto: CreateConsultationDto,
  ) {
    const {
      doctorId,
      scheduledAt: scheduledAtInput,
      patientNotes,
    } = createConsultationDto;

    const [patient, doctor] = await Promise.all([
      this.prisma.patient.findUnique({
        where: { userId: patientUserId },
        select: { id: true },
      }),
      this.prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true },
      }),
    ]);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const scheduledAt = new Date(scheduledAtInput);

    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid scheduledAt');
    }

    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('scheduledAt must be in the future');
    }

    if (
      scheduledAt.getMinutes() !== 0 ||
      scheduledAt.getSeconds() !== 0 ||
      scheduledAt.getMilliseconds() !== 0
    ) {
      throw new BadRequestException('scheduledAt must be on the hour');
    }

    const slotEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

    const [doctorConflict, patientConflict] = await Promise.all([
      this.prisma.consultation.findFirst({
        where: {
          doctorId: doctor.id,
          scheduledAt: {
            gte: scheduledAt,
            lt: slotEnd,
          },
          status: {
            in: [ConsultationStatus.PENDING, ConsultationStatus.ONGOING],
          },
        },
        select: { id: true },
      }),
      this.prisma.consultation.findFirst({
        where: {
          patientId: patient.id,
          scheduledAt: {
            gte: scheduledAt,
            lt: slotEnd,
          },
          status: {
            in: [ConsultationStatus.PENDING, ConsultationStatus.ONGOING],
          },
        },
        select: { id: true },
      }),
    ]);

    if (doctorConflict) {
      throw new ConflictException('Doctor already booked for this slot');
    }

    if (patientConflict) {
      throw new ConflictException('Patient already booked for this slot');
    }

    const dayOfWeek = this.toDayOfWeek(scheduledAt);
    const hour = scheduledAt.getHours();
    const timeSlot = `${String(hour).padStart(2, '0')}:00`;

    const availability = await this.prisma.availabilityTemplate.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
        startTime: { lte: timeSlot },
        endTime: { gt: timeSlot },
      },
      select: { id: true },
    });

    if (!availability) {
      throw new BadRequestException('Doctor not available for selected time');
    }

    const consultationId = randomUUID();
    const meetingLink = this.buildMeetingLink(consultationId);

    return this.prisma.consultation.create({
      data: {
        id: consultationId,
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        patientNotes,
        meetingLink,
      },
    });
  }

  private toDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUN,
      DayOfWeek.MON,
      DayOfWeek.TUE,
      DayOfWeek.WED,
      DayOfWeek.THU,
      DayOfWeek.FRI,
      DayOfWeek.SAT,
    ];

    return days[date.getDay()];
  }

  private buildMeetingLink(consultationId: string) {
    return `https://meet.jit.si/consult-${consultationId}`;
  }

  findDoctorConsultations(doctorId: string) {
    return this.prisma.consultation.findMany({
      where: { doctorId },
      include: consultationInclude,
    });
  }

  findById(id: string) {
    return this.prisma.consultation.findUnique({
      where: { id },
      include: consultationInclude,
    });
  }

  cancel(id: string) {
    return this.prisma.consultation.update({
      where: {
        id,
      },
      data: {
        status: ConsultationStatus.CANCELLED,
      },
    });
  }
}
