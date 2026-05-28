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
import { consultationInclude } from 'src/shared/constants';
import { PopulatedConsultation } from 'src/shared/@types/consultation';
import {
  getNowPhtEpochMs,
  getPhtEpochMsFromUtc,
  getPhtPartsFromUtc,
  parseIsoToUtcDate,
  toUtcFromPhtParts,
} from 'src/shared/timezone';

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

    const scheduledAt = await this.validateSlot({
      doctorId: doctor.id,
      patientId: patient.id,
      scheduledAtInput,
    });

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

  private toDayOfWeek(dayIndex: number): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUN,
      DayOfWeek.MON,
      DayOfWeek.TUE,
      DayOfWeek.WED,
      DayOfWeek.THU,
      DayOfWeek.FRI,
      DayOfWeek.SAT,
    ];

    return days[dayIndex];
  }

  private buildMeetingLink(consultationId: string) {
    return `https://meet.jit.si/consult-${consultationId}`;
  }

  findPatientConsultations(
    patientId: string,
  ): Promise<PopulatedConsultation[]> {
    return this.prisma.consultation.findMany({
      where: { patientId },
      include: consultationInclude,
    });
  }

  findDoctorConsultations(doctorId: string): Promise<PopulatedConsultation[]> {
    return this.prisma.consultation.findMany({
      where: { doctorId },
      include: consultationInclude,
    });
  }

  async getBookedSlotsForDoctor(
    doctorId: string,
    range: { from: string; to: string },
  ): Promise<string[]> {
    const fromUtc = parseIsoToUtcDate(range.from);
    const toUtc = parseIsoToUtcDate(range.to);

    if (!fromUtc || !toUtc) {
      throw new BadRequestException('Invalid from or to');
    }

    if (fromUtc.getTime() >= toUtc.getTime()) {
      throw new BadRequestException('from must be before to');
    }

    const consultations = await this.prisma.consultation.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: fromUtc,
          lt: toUtc,
        },
        status: {
          in: [ConsultationStatus.PENDING, ConsultationStatus.ONGOING],
        },
      },
      select: { scheduledAt: true },
    });

    const booked: string[] = Array.from(
      new Set(
        consultations.map(({ scheduledAt }) => {
          const phtParts = getPhtPartsFromUtc(scheduledAt);
          const slotUtc = toUtcFromPhtParts({
            year: phtParts.year,
            month: phtParts.month,
            day: phtParts.day,
            hour: phtParts.hour,
            minute: 0,
            second: 0,
            millisecond: 0,
          });

          return slotUtc.toISOString();
        }),
      ),
    ).sort();

    return booked;
  }

  findById(id: string): Promise<PopulatedConsultation | null> {
    return this.prisma.consultation.findUnique({
      where: { id },
      include: consultationInclude,
    });
  }

  addDoctorNotes(consultationId: string, doctorNotes: string) {
    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: { doctorNotes },
    });
  }

  async reschedule(
    consultation: PopulatedConsultation,
    scheduledAtInput: string,
  ) {
    const scheduledAt = await this.validateSlot({
      doctorId: consultation.doctorId,
      patientId: consultation.patientId,
      scheduledAtInput,
      excludeConsultationId: consultation.id,
    });

    return this.prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        scheduledAt,
        rescheduledFrom: consultation.scheduledAt,
      },
    });
  }

  cancel(consultationId: string) {
    return this.prisma.consultation.update({
      where: {
        id: consultationId,
      },
      data: {
        status: ConsultationStatus.CANCELLED,
      },
    });
  }

  private async validateSlot(params: {
    doctorId: string;
    patientId: string;
    scheduledAtInput: string;
    excludeConsultationId?: string;
  }) {
    const { doctorId, patientId, scheduledAtInput, excludeConsultationId } =
      params;

    const parsedUtc = parseIsoToUtcDate(scheduledAtInput);

    if (!parsedUtc) {
      throw new BadRequestException('Invalid scheduledAt');
    }

    const phtParts = getPhtPartsFromUtc(parsedUtc);
    const phtMs = getPhtEpochMsFromUtc(parsedUtc);
    const nowPhtMs = getNowPhtEpochMs();

    if (phtMs <= nowPhtMs) {
      throw new BadRequestException('scheduledAt must be in the future');
    }

    if (
      phtParts.minute !== 0 ||
      phtParts.second !== 0 ||
      phtParts.millisecond !== 0
    ) {
      throw new BadRequestException('scheduledAt must be on the hour');
    }

    const scheduledAt = toUtcFromPhtParts({
      year: phtParts.year,
      month: phtParts.month,
      day: phtParts.day,
      hour: phtParts.hour,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const slotEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
    const conflictBase: Prisma.ConsultationWhereInput = {
      scheduledAt: {
        gte: scheduledAt,
        lt: slotEnd,
      },
      status: {
        in: [ConsultationStatus.PENDING, ConsultationStatus.ONGOING],
      },
    };
    const exclude = excludeConsultationId
      ? { id: { not: excludeConsultationId } }
      : {};

    const [doctorConflict, patientConflict] = await Promise.all([
      this.prisma.consultation.findFirst({
        where: {
          doctorId,
          ...conflictBase,
          ...exclude,
        },
        select: { id: true },
      }),
      this.prisma.consultation.findFirst({
        where: {
          patientId,
          ...conflictBase,
          ...exclude,
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

    const dayOfWeek = this.toDayOfWeek(phtParts.dayOfWeekIndex);
    const hour = phtParts.hour;
    const timeSlot = `${String(hour).padStart(2, '0')}:00`;

    const availability = await this.prisma.availabilityTemplate.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        startTime: { lte: timeSlot },
        endTime: { gt: timeSlot },
      },
      select: { id: true },
    });

    if (!availability) {
      throw new BadRequestException('Doctor not available for selected time');
    }

    return scheduledAt;
  }
}
