import { IsInt, IsOptional, IsString } from 'class-validator';

export class OnboardDoctorDto {
  @IsString()
  specializationId: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  yearsOfPractice?: number;
}
