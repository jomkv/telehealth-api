import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { ENV_VARS } from 'src/shared/env-variables';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.findUserByEmail(loginDto.email);

    // Note: might want to use more vague error messages, instead of specifying what input was wrong.

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (
      !(await this.authService.isPasswordCorrect(
        loginDto.password,
        user.password,
      ))
    ) {
      throw new BadRequestException('Incorrect password');
    }

    const accessToken = await this.authService.generateAccessToken(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: ENV_VARS.isProd(),
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Explicitly exclude password from response payload
    const { password, ...userPayload } = user;

    return { ...userPayload, accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: ENV_VARS.isProd(),
      sameSite: 'strict',
    });

    return;
  }
}
