import { IsEnum, IsString, Matches } from 'class-validator';
import { DayOfWeek } from 'generated/prisma/enums';

export class AvailabilityRowDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^\d{2}:00$/, {
    message: 'startTime must be on the hour e.g. "09:00"',
  })
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:00$/, {
    message: 'endTime must be on the hour e.g. "17:00"',
  })
  endTime: string;
}
