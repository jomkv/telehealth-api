import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { PatientService } from './patient.service';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { PopulatedPatient } from 'src/shared/@types/patient';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { MeUser } from 'src/shared/@types/user';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Patch('me')
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  updateMe(
    @Req() req: Request,
    @Body(ValidationPipe) updatePatientDto: UpdatePatientDto,
  ): Promise<MeUser> {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    return this.patientService.updateByUserId(req.user.id, updatePatientDto);
  }

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
