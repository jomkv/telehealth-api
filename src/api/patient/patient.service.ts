import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardPatientDto } from './dto/onboard-patient.dto';
import { Patient, Prisma } from 'generated/prisma/client';
import { PopulatedPatient } from 'src/shared/@types/patient';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { MeUser } from 'src/shared/@types/user';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  findById(patientId: string): Promise<PopulatedPatient | null> {
    return this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            birthday: true,
            mobileNumber: true,
            isOnboarded: true,
            createdAt: true,
            profilePic: true,
          },
        },
      },
    });
  }

  findByUserId(userId: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });
  }

  async onboard(
    userId: string,
    dto: OnboardPatientDto,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const existing = await tx.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Patient already onboarded');
    }

    return await tx.patient.create({
      data: {
        userId,
        weight: dto.weight,
        height: dto.height,
        conditions: dto.conditions ?? [],
        allergies: dto.allergies ?? [],
        medications: dto.medications ?? [],
        notes: dto.notes,
      },
    });
  }

  async updateByUserId(userId: string, dto: UpdatePatientDto): Promise<MeUser> {
    const existing = await this.prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Patient not found');
    }

    const updatedPatient = await this.prisma.patient.update({
      where: { id: existing.id },
      data: {
        weight: dto.weight,
        height: dto.height,
        conditions: dto.conditions,
        allergies: dto.allergies,
        medications: dto.medications,
        notes: dto.notes ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            birthday: true,
            mobileNumber: true,
            isOnboarded: true,
            createdAt: true,
            profilePic: true,
          },
        },
      },
    });

    const { user, ...patient } = updatedPatient;

    return { ...user, patient };
  }
}
