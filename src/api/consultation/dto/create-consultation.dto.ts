import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  doctorId: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @IsNotEmpty()
  patientNotes: string;
}
