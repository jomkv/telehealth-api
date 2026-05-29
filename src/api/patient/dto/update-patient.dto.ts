import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
