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
  BadRequestException,
  NotFoundException,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { ConsultationStatus, Role } from 'generated/prisma/enums';
import { Request } from 'express';
import { DoctorService } from '../doctor/doctor.service';
import { Doctor } from 'generated/prisma/client';

@Controller('consultation')
export class ConsultationController {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly doctorService: DoctorService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  create(
    @Req() req: Request,
    @Body(ValidationPipe) createConsultationDto: CreateConsultationDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    return this.consultationService.create(req.user.id, createConsultationDto);
  }

  @Get('doctor')
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  async findAll(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    const doctor: Doctor | null = await this.doctorService.findByUserId(
      req.user.id,
    );

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.consultationService.findDoctorConsultations(doctor.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationService.findById(id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  async cancel(@Res() req: Request, @Param('id') id: string) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    const consultation = await this.consultationService.findById(id);

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // If req.user is not the patient AND doctor of the consultation
    if (
      req.user.id !== consultation.doctor.userId &&
      req.user.id !== consultation.patient.userId
    ) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    if (
      consultation.status === ConsultationStatus.CANCELLED ||
      consultation.status === ConsultationStatus.DONE
    ) {
      throw new BadRequestException('Consultation already cancelled/done');
    }

    return await this.consultationService.cancel(id);
  }
}
