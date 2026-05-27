import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import {
  AllowAnyOnboarding,
  AuthGuard,
  UnonboardedOnly,
} from '../auth/guards/auth.guard';
import { User } from 'generated/prisma/client';
import { DoctorService } from '../doctor/doctor.service';
import { PatientService } from '../patient/patient.service';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @AllowAnyOnboarding()
  async me(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    const meUser = await this.userService.findOne(req.user.id);

    if (!meUser) {
      throw new NotFoundException('User not found');
    }

    const meDoctor = await this.doctorService.getMe(req.user.id);
    const mePatient = await this.patientService.getMe(req.user.id);

    return { ...meUser, doctor: meDoctor, patient: mePatient };
  }

  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const existing: User | null = await this.userService.findUserByEmail(
      createUserDto.email,
    );

    if (existing) {
      throw new BadRequestException('Email already taken');
    }

    return await this.userService.create(createUserDto);
  }

  @Post('onboard')
  @UseGuards(AuthGuard)
  @UnonboardedOnly()
  onboard(
    @Req() req: Request,
    @Body(ValidationPipe) onboardUserDto: OnboardUserDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    return this.userService.onboard(req.user, onboardUserDto);
  }
}
