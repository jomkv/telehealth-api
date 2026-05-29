import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'generated/prisma/client';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsDateString()
  birthday: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @IsNotEmpty()
  mobileNumber: string;
}
