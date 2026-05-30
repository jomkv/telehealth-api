import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  specializationId: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfPractice?: number;
}
