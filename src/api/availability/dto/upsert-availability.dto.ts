import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilityRowDto } from './availability-row.dto';

export class UpsertAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRowDto)
  availability: AvailabilityRowDto[];
}
