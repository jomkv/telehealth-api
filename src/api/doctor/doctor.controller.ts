import { Controller, Get, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  AllowAnyOnboarding,
  AuthGuard,
  Roles,
} from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('specializations')
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  @AllowAnyOnboarding()
  getSpecializations() {
    return this.doctorService.getAllSpecializations();
  }
}
