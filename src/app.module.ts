import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { DoctorModule } from './api/doctor/doctor.module';
import { PatientModule } from './api/patient/patient.module';
import { AvailabilityModule } from './api/availability/availability.module';
import { ConsultationModule } from './api/consultation/consultation.module';
import { NotificationModule } from './api/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UserModule,
    AuthModule,
    DoctorModule,
    PatientModule,
    AvailabilityModule,
    ConsultationModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 60, // 60 requests per minute per IP
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
