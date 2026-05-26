import { Controller, Get, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { AllowAnyOnboarding, AuthGuard } from '../auth/guards/auth.guard';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('specializations')
  @UseGuards(AuthGuard)
  @AllowAnyOnboarding()
  getSpecializations() {
    return this.doctorService.getAllSpecializations();
  }
}
