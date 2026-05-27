import { IsNotEmpty, IsString } from 'class-validator';

export class DoctorNotesDto {
  @IsString()
  @IsNotEmpty()
  doctorNotes: string;
}
