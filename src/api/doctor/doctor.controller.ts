import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Patch,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { ConsultationService } from '../consultation/consultation.service';
import {
  AllowAnyOnboarding,
  AuthGuard,
  Roles,
} from '../auth/guards/auth.guard';
import { Role } from 'generated/prisma/enums';
import { PopulatedDoctor } from 'src/shared/@types/doctor';
import { SymptomSearchDto } from './dto/symptom-search.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { MeUser } from 'src/shared/@types/user';

@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly consultationService: ConsultationService,
  ) {}

  @Patch('me')
  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  updateMe(
    @Req() req: Request,
    @Body(ValidationPipe) updateDoctorDto: UpdateDoctorDto,
  ): Promise<MeUser> {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    return this.doctorService.updateByUserId(req.user.id, updateDoctorDto);
  }

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

  @Get('symptoms')
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  symptomSearch(@Query() { symptoms }: SymptomSearchDto) {
    return this.doctorService.findDoctorsBySymptoms(symptoms);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.PATIENT)
  async getOne(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const baseDoctor: PopulatedDoctor | null =
      await this.doctorService.findById(id);

    if (!baseDoctor) {
      throw new NotFoundException('Doctor not found');
    }

    let bookedSlots: string[] = [];

    if (!from && !to) {
      return { ...baseDoctor, bookedSlots };
    }

    if (!from || !to) {
      throw new BadRequestException('`from` and `to` required together');
    }

    bookedSlots = await this.consultationService.getBookedSlotsForDoctor(id, {
      from,
      to,
    });

    return { ...baseDoctor, bookedSlots };
  }
}
