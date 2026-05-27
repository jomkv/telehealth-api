import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardPatientDto } from './dto/onboard-patient.dto';
import { Patient, Prisma } from 'generated/prisma/client';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  getMe(userId: string): Promise<Patient | null> {
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
}
