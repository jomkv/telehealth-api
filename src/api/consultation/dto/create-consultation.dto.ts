import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  doctorId: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  patientNotes: string;
}
