import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SymptomSearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Symptom cannot be longer than 200 characters' })
  symptoms: string;
}
