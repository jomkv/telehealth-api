import { Module, forwardRef } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConsultationModule } from '../consultation/consultation.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ConsultationModule)],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
