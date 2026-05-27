import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [PrismaModule, DoctorModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
