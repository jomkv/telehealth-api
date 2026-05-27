import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  findOne(@Param('id') id: string) {
    return this.patientService.findById(id);
  }
}
