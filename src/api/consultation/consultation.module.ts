import { Module, forwardRef } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PatientModule } from '../patient/patient.module';
import { ConsultationScheduler } from './scheduler/consultation.scheduler';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => DoctorModule),
    PatientModule,
    NotificationModule,
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService, ConsultationScheduler],
  exports: [ConsultationService],
})
export class ConsultationModule {}
