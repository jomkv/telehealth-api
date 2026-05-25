import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  // @IsEmail()
  // @IsNotEmpty()
  // email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
