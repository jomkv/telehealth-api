import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { PopulatedPatient } from 'src/shared/@types/patient';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  async findOne(@Param('id') id: string) {
    const patient: PopulatedPatient | null =
      await this.patientService.findById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}
