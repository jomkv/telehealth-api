import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import {
  AllowAnyOnboarding,
  AuthGuard,
  UnonboardedOnly,
} from '../auth/guards/auth.guard';
import { User } from 'generated/prisma/client';
import { MeUser } from 'src/shared/@types/user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @AllowAnyOnboarding()
  async me(@Req() req: Request): Promise<MeUser> {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    const meUser = await this.userService.findOne(req.user.id);

    if (!meUser) {
      throw new NotFoundException('User not found');
    }

    return this.userService.findMe(meUser);
  }

  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const existing: User | null = await this.userService.findUserByEmail(
      createUserDto.email,
    );

    if (existing) {
      throw new BadRequestException('Email already taken');
    }

    return await this.userService.create(createUserDto);
  }

  @Post('onboard')
  @UseGuards(AuthGuard)
  @UnonboardedOnly()
  onboard(
    @Req() req: Request,
    @Body(ValidationPipe) onboardUserDto: OnboardUserDto,
  ): Promise<MeUser> {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    return this.userService.onboard(req.user, onboardUserDto);
  }
}
