import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardPatientDto } from './dto/onboard-patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async onboard(userId: string, dto: OnboardPatientDto) {
    const existing = await this.prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Patient already onboarded');
    }

    return this.prisma.patient.create({
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
