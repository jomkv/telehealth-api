import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import { MeUser } from 'src/shared/@types/user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeUser> {
    const user = await this.userService.findUserByEmail(loginDto.email);

    // Note: might want to use more vague error messages, instead of specifying what input was wrong.

    if (!user) {
      throw new NotFoundException('Email not found');
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

    const isProd = ENV_VARS.isProd();
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: isProd ? ENV_VARS.prodDomain() : undefined,
    });
    // Explicitly exclude password from response payload
    const { password, ...userPayload } = user;

    return this.userService.findMe(userPayload);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = ENV_VARS.isProd();
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    return;
  }
}
