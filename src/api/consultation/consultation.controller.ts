import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { DoctorNotesDto } from './dto/doctor-notes.dto';
import { RescheduleConsultationDto } from './dto/reschedule-consultation.dto';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { Request } from 'express';
import { DoctorService } from '../doctor/doctor.service';
import { Doctor, Patient } from 'generated/prisma/client';
import { ConsultationGuard, RequireNotDone } from './guards/consultation.guard';
import { PopulatedConsultation } from 'src/shared/@types/consultation';
import { PatientService } from '../patient/patient.service';

@Controller('consultation')
export class ConsultationController {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  create(
    @Req() req: Request,
    @Body(ValidationPipe) createConsultationDto: CreateConsultationDto,
  ) {
    return this.consultationService.create(req.user.id, createConsultationDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: Request): Promise<PopulatedConsultation[]> {
    if (req.user.role === Role.DOCTOR) {
      const doctor: Doctor | null = await this.doctorService.findByUserId(
        req.user.id,
      );

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      return this.consultationService.findDoctorConsultations(doctor.id);
    } else {
      const patient: Patient | null = await this.patientService.findByUserId(
        req.user.id,
      );

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      return this.consultationService.findPatientConsultations(patient.id);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard, ConsultationGuard)
  findOne(@Req() req: Request) {
    return req.consultation;
  }

  @Patch(':id/doctor-notes')
  @UseGuards(AuthGuard, ConsultationGuard)
  @Roles(Role.DOCTOR)
  addDoctorNotes(
    @Param('id') id: string,
    @Body(ValidationPipe) doctorNotesDto: DoctorNotesDto,
  ) {
    return this.consultationService.addDoctorNotes(
      id,
      doctorNotesDto.doctorNotes,
    );
  }

  @Patch(':id/reschedule')
  @UseGuards(AuthGuard, ConsultationGuard)
  @RequireNotDone()
  reschedule(
    @Req() req: Request,
    @Body(ValidationPipe) rescheduleDto: RescheduleConsultationDto,
  ) {
    return this.consultationService.reschedule(req.consultation, req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard, ConsultationGuard)
  @RequireNotDone()
  cancel(@Param('id') id: string) {
    return this.consultationService.cancel(id);
  }
}
