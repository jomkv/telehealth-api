import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [PrismaModule, DoctorModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
