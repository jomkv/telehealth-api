import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DoctorNotesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  doctorNotes: string;
}
