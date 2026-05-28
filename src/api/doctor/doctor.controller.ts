import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  @AllowAnyOnboarding()
  getSpecializations() {
    return this.doctorService.getAllSpecializations();
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  getAll(@Query('q') queryString: string) {
    return this.doctorService.searchDoctor(queryString);
  }
}
