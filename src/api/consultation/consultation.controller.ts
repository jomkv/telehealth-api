import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
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
    return this.consultationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationService.update(+id, updateConsultationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultationService.remove(+id);
  }
}
