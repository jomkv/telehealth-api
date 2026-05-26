import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PatientModule } from '../patient/patient.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [PrismaModule, PatientModule, DoctorModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
