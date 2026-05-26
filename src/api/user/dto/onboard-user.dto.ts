import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { OnboardDoctorDto } from '../../doctor/dto/onboard-doctor.dto';
import { OnboardPatientDto } from '../../patient/dto/onboard-patient.dto';

export class OnboardUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardPatientDto)
  patient?: OnboardPatientDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardDoctorDto)
  doctor?: OnboardDoctorDto;
}
