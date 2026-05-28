import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardDoctorDto } from './dto/onboard-doctor.dto';
import { Prisma } from 'generated/prisma/client';
import {
  DoctorWithSpecialization,
  PopulatedDoctor,
} from 'src/shared/@types/doctor';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<DoctorWithSpecialization | null> {
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

  findById(doctorId: string): Promise<PopulatedDoctor | null> {
    return this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        specialization: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
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
        availability: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async searchDoctors(queryString: string): Promise<PopulatedDoctor[]> {
    const userDoctors = await this.prisma.user.findMany({
      where: {
        name: {
          search: queryString,
        },
        role: 'DOCTOR',
      },
      include: {
        doctor: {
          include: {
            specialization: {
              select: {
                id: true,
                label: true,
                description: true,
              },
            },
          },
        },
      },
    });

    const formattedDoctors = userDoctors.map((userDoctor) => {
      const { doctor, password, ...user } = userDoctor;

      return {
        ...doctor,
        user: user,
      };
    });

    return formattedDoctors;
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
