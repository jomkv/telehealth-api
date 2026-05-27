import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { DoctorModule } from './api/doctor/doctor.module';
import { PatientModule } from './api/patient/patient.module';
import { AvailabilityModule } from './api/availability/availability.module';

@Module({
  imports: [UserModule, AuthModule, DoctorModule, PatientModule, AvailabilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
