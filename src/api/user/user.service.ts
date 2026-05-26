import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { User, Role } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await hash(createUserDto.password, 10);
    const birthdayDate = new Date(createUserDto.birthday);

    if (Number.isNaN(birthdayDate.getTime())) {
      throw new BadRequestException(
        'Invalid birthday date. Expected format YYYY-MM-DD.',
      );
    }

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        role: createUserDto.role,
        birthday: birthdayDate,
        mobileNumber: createUserDto.mobileNumber,
        isOnboarded: createUserDto.isOnboarded ?? false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        birthday: true,
        mobileNumber: true,
        isOnboarded: true,
        createdAt: true,
      },
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
