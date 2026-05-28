import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { User, Role } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { PatientService } from '../patient/patient.service';
import { DoctorService } from '../doctor/doctor.service';
import { MeUser, UserPayload } from 'src/shared/@types/user';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await hash(createUserDto.password, 10);
    const birthdayDate = new Date(createUserDto.birthday);

    if (Number.isNaN(birthdayDate.getTime())) {
      throw new BadRequestException(
        'Invalid birthday date. Expected format YYYY-MM-DD.',
      );
    }

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        role: createUserDto.role,
        birthday: birthdayDate,
        mobileNumber: createUserDto.mobileNumber,
        isOnboarded: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        birthday: true,
        mobileNumber: true,
        isOnboarded: true,
        createdAt: true,
      },
    });
  }

  async onboard(
    user: UserPayload,
    onboardUserDto: OnboardUserDto,
  ): Promise<MeUser> {
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      if (user.role === Role.PATIENT) {
        if (!onboardUserDto.patient) {
          throw new BadRequestException('Patient onboarding data required');
        }

        await this.patientService.onboard(user.id, onboardUserDto.patient, tx);
      }

      if (user.role === Role.DOCTOR) {
        if (!onboardUserDto.doctor) {
          throw new BadRequestException('Doctor onboarding data required');
        }

        await this.doctorService.onboard(user.id, onboardUserDto.doctor, tx);
      }

      return await tx.user.update({
        where: { id: user.id },
        data: { isOnboarded: true },
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
      });
    });

    return this.findMe(updatedUser);
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
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
    });
  }

  async findMe(user: Omit<User, 'password'>): Promise<MeUser> {
    const doctor = await this.doctorService.findByUserId(user.id);
    const patient = await this.patientService.findByUserId(user.id);

    return { ...user, doctor, patient };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
