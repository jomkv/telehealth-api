import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  AllowAnyOnboarding,
  AuthGuard,
  Roles,
} from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { PopulatedDoctor } from 'src/shared/@types/doctor';

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
    return this.doctorService.searchDoctors(queryString);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  async getOne(@Param('id') id: string) {
    const doctor: PopulatedDoctor | null =
      await this.doctorService.findById(id);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
