import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';
import { Roles, AuthGuard } from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { Request } from 'express';
import { DoctorService } from '../doctor/doctor.service';
import { Doctor } from 'generated/prisma/client';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly doctorService: DoctorService,
  ) {}

  @Get(':doctorId')
  @UseGuards(AuthGuard)
  getByDoctor(@Param('doctorId') doctorId: string) {
    return this.availabilityService.getByDoctor(doctorId);
  }

  @Put()
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  async upsertTemplate(
    @Req() req: Request,
    @Body() dto: UpsertAvailabilityDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    const doctor: Doctor | null = await this.doctorService.getMe(req.user.id);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return await this.availabilityService.upsertTemplate(doctor.id, dto);
  }
}
