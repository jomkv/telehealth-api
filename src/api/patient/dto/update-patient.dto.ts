import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePatientDto {
  @IsNumber()
  @Min(1)
  weight: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  medications?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(600)
  notes?: string;
}
