import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  specializationId: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  yearsOfPractice?: number;
}
