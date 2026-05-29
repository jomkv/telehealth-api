import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
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

  @Patch('me')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profilePic', { storage: multer.memoryStorage() }),
  )
  async updateMe(
    @Req() req: Request,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ): Promise<MeUser> {
    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }
    return this.userService.updateMe(req.user, updateUserDto, file);
  }
}
