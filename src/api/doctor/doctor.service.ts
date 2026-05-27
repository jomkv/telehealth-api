import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardDoctorDto } from './dto/onboard-doctor.dto';
import { Doctor, Prisma } from 'generated/prisma/client';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  getMe(userId: string): Promise<Doctor | null> {
    return this.prisma.doctor.findUnique({
      where: {
        userId,
      },
      include: {
        specialization: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
      },
    });
  }

  async onboard(
    userId: string,
    dto: OnboardDoctorDto,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const existing = await tx.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Doctor already onboarded');
    }

    return await tx.doctor.create({
      data: {
        userId,
        specializationId: dto.specializationId,
        bio: dto.bio,
        yearsOfPractice: dto.yearsOfPractice,
      },
    });
  }

  getAllSpecializations(includeEmbedding: boolean = false) {
    return this.prisma.specialization.findMany({
      select: {
        id: true,
        label: true,
        description: true,
        embedding: includeEmbedding,
      },
    });
  }
}
