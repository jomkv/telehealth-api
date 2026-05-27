import { IsDateString } from 'class-validator';

export class RescheduleConsultationDto {
  @IsDateString()
  scheduledAt: string;
}
